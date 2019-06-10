package net.nanopay.tx.bmo;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.CABankAccount;
import net.nanopay.model.Branch;
import net.nanopay.model.Currency;
import net.nanopay.payment.Institution;
import net.nanopay.tx.alterna.AlternaCOTransaction;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.bmo.cico.BmoCOTransaction;
import net.nanopay.tx.bmo.cico.BmoTransaction;
import net.nanopay.tx.bmo.eftfile.*;
import net.nanopay.tx.bmo.exceptions.BmoEftFileException;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class BmoEftFileGenerator {

  X x;
  DAO clientValueDAO;
  DAO currencyDAO;
  DAO bmoEftFileDAO;
  Logger logger;
  private ArrayList<Transaction> passedTransactions = new ArrayList<>();

  public static final String SEND_FOLDER = System.getenv("JOURNAL_HOME") + "/bmo_eft/send/";
  public static final String SEND_FAILED = System.getenv("JOURNAL_HOME") + "/bmo_eft/send_failed/";

  public BmoEftFileGenerator(X x) {
    this.x = x;
    this.clientValueDAO = (DAO) x.get("bmoClientValueDAO");
    this.currencyDAO = (DAO) x.get("currencyDAO");
    this.bmoEftFileDAO = (DAO) x.get("bmoEftFileDAO");
    this.logger = (Logger) x.get("logger");
  }

  public File createEftFile(BmoEftFile eftFile) {
    File file = null;

    try {
      file = new File(SEND_FOLDER + eftFile.getFileName());
      FileUtils.touch(file);
      FileUtils.writeStringToFile(file, eftFile.toBmoFormat(), false);

    } catch (IOException e) {
      this.logger.error("Error when create bmo file.", e);
      throw new BmoEftFileException("Error when create bmo file.", e);
    }

    return file;
  }

  public BmoEftFile initFile(List<Transaction> transactions) {
    BmoFileHeader fileHeader = null;
    List<BmoBatchRecord> records = new ArrayList<>();
    BmoFileControl fileControl = new BmoFileControl();
    BmoAssignedClientValue clientValue = null;

    if ( transactions.get(0) instanceof CITransaction ) {
      clientValue = (BmoAssignedClientValue) this.clientValueDAO.inX(x).find("CAD-DEBIT");
    } else {
      clientValue = (BmoAssignedClientValue) this.clientValueDAO.inX(x).find("CAD-CREDIT");
    }

    try {
      // file header
      fileHeader = createFileHeader(clientValue);
      fileHeader.validate(x);

      // batch record
      List<Transaction> ciTransactions = transactions.stream()
        .filter(transaction -> transaction instanceof CITransaction)
        .collect(Collectors.toList());

      List<Transaction> coTransactions = transactions.stream()
        .filter(transaction -> transaction instanceof COTransaction)
        .collect(Collectors.toList());

      BmoBatchRecord ciBatchRecord = createBatchRecord(ciTransactions, clientValue);
      BmoBatchRecord coBatchRecord = createBatchRecord(coTransactions, clientValue);
      if ( ciBatchRecord != null ) records.add(ciBatchRecord);
      if ( coBatchRecord != null ) records.add(coBatchRecord);
      if ( records.size() == 0 ) throw new RuntimeException("No transactions for BMO EFT");

      // file control
      fileControl.setTotalNumberOfD(ciBatchRecord == null ? 0 : ciBatchRecord.getBatchControlRecord().getBatchRecordCount());
      fileControl.setTotalValueOfD(ciBatchRecord == null ? 0 : ciBatchRecord.getBatchControlRecord().getBatchAmount());
      fileControl.setTotalNumberOfC(coBatchRecord == null ? 0 : coBatchRecord.getBatchControlRecord().getBatchRecordCount());
      fileControl.setTotalValueOfC(coBatchRecord == null ? 0 : coBatchRecord.getBatchControlRecord().getBatchAmount());

    } catch ( Exception e ) {
      // if any exception occurs here, no transaction will be sent out
      this.passedTransactions.clear();
      this.logger.error("Error when init bmo eft file");
      throw new BmoEftFileException("Error when init bmo eft file", e);
    }

    BmoEftFile file = new BmoEftFile();
    file.setHeaderRecord(fileHeader);
    file.setBatchRecords(records.toArray(new BmoBatchRecord[records.size()]));
    file.setTrailerRecord(fileControl);
    file.setProduction(clientValue.getProduction());
    file.setFileName(fileHeader.getFileCreationNumber() + "-" + clientValue.getId() + ".txt");
    file.setBeautifyString(file.beautify());
    file.setFileCreationTimeEST(BmoFormatUtil.getCurrentDateTimeEST());

    return file;
  }

  public BmoFileHeader createFileHeader(BmoAssignedClientValue clientValue) {
    int fileCreationNumber = 0;

    if ( clientValue.getProduction() ) {
      Count count = (Count) bmoEftFileDAO.inX(x).where(MLang.EQ(BmoEftFile.PRODUCTION, true)).select(new Count());
      fileCreationNumber = (int) (count.getValue() + 1);
    }

    BmoFileHeader fileHeader = new BmoFileHeader();
    fileHeader.setOriginatorId(clientValue.getOriginatorId());
    fileHeader.setFileCreationNumber(fileCreationNumber);
    fileHeader.setDestinationDataCentreCode(clientValue.getDestinationDataCentre());
    fileHeader.setFileCreationDate(BmoFormatUtil.getCurrentJulianDateEST());
    return fileHeader;
  }

  public BmoBatchRecord createBatchRecord(List<Transaction> transactions, BmoAssignedClientValue clientValue) {
    if ( transactions == null || transactions.size() == 0 ) {
      return null;
    }

    BmoBatchRecord batchRecord = null;
    String type = transactions.get(0) instanceof CITransaction ? "D" : "C";
    ArrayList<Transaction> tempSuccessHolder = new ArrayList<>();

    try {
      /**
       * batch header
       */
      BmoBatchHeader batchHeader = new BmoBatchHeader();
      batchHeader.setBatchPaymentType(type);
      batchHeader.setTransactionTypeCode(430);
      batchHeader.setPayableDate(BmoFormatUtil.getCurrentJulianDateEST());
      batchHeader.setOriginatorShortName(clientValue.getOriginatorShortName());
      batchHeader.setOriginatorLongName(clientValue.getOriginatorLongName());
      batchHeader.setInstitutionIdForReturns(clientValue.getInstitutionIdForReturns());
      batchHeader.setAccountNumberForReturns(clientValue.getAccountNumberForReturns());

      /**
       * batch details
       */
      long sum = 0;
      List<BmoDetailRecord> detailRecords = new ArrayList<>();
      for (Transaction transaction : transactions) {

        try {
          isValidTransaction(transaction);

          CABankAccount bankAccount = null;
          if ( type.equals("D") ) {
            bankAccount = getAccountById(transaction.getSourceAccount());
          } else {
            bankAccount = getAccountById(transaction.getDestinationAccount());
          }

          BmoDetailRecord detailRecord = new BmoDetailRecord();
          detailRecord.setAmount(transaction.getAmount());
          detailRecord.setLogicalRecordTypeId(type);
          detailRecord.setClientName(getNameById(bankAccount.getOwner()));
          detailRecord.setClientInstitutionId(getInstitutionById(bankAccount.getInstitution()) + getBranchById(bankAccount.getBranch()));
          detailRecord.setClientAccountNumber(bankAccount.getAccountNumber());
          detailRecord.setReferenceNumber(String.valueOf(getRefNumber(transaction)));
          detailRecord.validate(x);

          sum = sum + transaction.getAmount();
          detailRecords.add(detailRecord);
          ((BmoTransaction)transaction).addHistory("Transaction added to EFT file");
          ((BmoTransaction)transaction).setBmoReferenceNumber(detailRecord.getReferenceNumber());
          tempSuccessHolder.add(transaction);

        } catch ( Exception e ) {
          this.logger.error("Error when add transaction to BMO EFT file", e);
          ((BmoTransaction)transaction).addHistory(e.getMessage());
          transaction.setStatus(TransactionStatus.FAILED);
        }

      }

      /**
       * batch control
       */
      BmoBatchControl batchControl = new BmoBatchControl();
      batchControl.setBatchPaymentType(type);
      batchControl.setBatchRecordCount(detailRecords.size());
      batchControl.setBatchAmount(sum);
      batchControl.validate(x);

      /**
       * batch record
       */
      if ( detailRecords== null || detailRecords.size() == 0 ) {
        return null;
      }
      batchRecord = new BmoBatchRecord();
      batchRecord.setBatchHeaderRecord(batchHeader);
      batchRecord.setDetailRecords(detailRecords.toArray(new BmoDetailRecord[detailRecords.size()]));
      batchRecord.setBatchControlRecord(batchControl);
      this.passedTransactions.addAll(tempSuccessHolder);

    } catch ( Exception e ) {
      logger.error("Error when create batch record", e);
      return null;
    }

    return batchRecord;
  }

  public long getRefNumber(Transaction transaction) {
    DAO refDAO = (DAO) x.get("bmoRefDAO");

    BmoReferenceNumber referenceNumber = new BmoReferenceNumber();
    referenceNumber.setTransactionId(transaction.getId());
    referenceNumber = (BmoReferenceNumber) refDAO.inX(x).put(referenceNumber);

    return referenceNumber.getId();
  }

  public CABankAccount getAccountById(long id) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    Account account = (Account) accountDAO.inX(x).find(id);

    if ( ! (account instanceof CABankAccount) ) {
      throw new RuntimeException("Wrong bank account type");
    }

    return (CABankAccount) account;
  }

  public String getNameById(long id) {
    DAO userDAO = (DAO) x.get("localUserDAO");

    User user = (User) userDAO.inX(x).find(id);

    String displayName = "";

    if ( ! SafetyUtil.isEmpty(user.getBusinessName()) ) {
      displayName = user.getBusinessName();
    } else {
      displayName = user.getFirstName() + " " + user.getLastName();
    }

    return displayName;
  }

  public String getInstitutionById(long id) {
    DAO institutionDAO = (DAO) x.get("institutionDAO");

    Institution institution = (Institution) institutionDAO.inX(x).find(id);
    return institution.getInstitutionNumber();
  }

  public String getBranchById(long id) {
    DAO branchDAO = (DAO) x.get("branchDAO");

    Branch branch = (Branch) branchDAO.inX(x).find(id);

    return branch.getBranchId();
  }

  public boolean isValidTransaction(Transaction transaction) {
    ((BmoTransaction) transaction).addHistory("Transaction picked by BmoEftFileGenerator");

    if ( ! (transaction instanceof BmoCITransaction || transaction instanceof BmoCOTransaction) ) {
      throw new RuntimeException("Wrong transaction type");
    }

    if ( (! transaction.getSourceCurrency().equals("CAD") ) && (! transaction.getDestinationCurrency().equals("CAD")) ) {
      throw new RuntimeException("Wrong currency type");
    }

    Currency currency = (Currency) this.currencyDAO.inX(x).find(MLang.EQ(Currency.ALPHABETIC_CODE, "CAD"));
    if ( currency.getPrecision() != 2 ) {
      throw new RuntimeException("Currently only support 2 decimals");
    }

    return true;
  }

  public ArrayList<Transaction> getPassedTransactions() {
    return passedTransactions;
  }
}
