package net.nanopay.fx.lianlianpay;

import foam.core.ContextAwareSupport;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.util.SafetyUtil;
import net.nanopay.fx.lianlianpay.model.*;
import org.apache.commons.io.IOUtils;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.util.encoders.Base64;

import javax.crypto.Cipher;
import javax.crypto.CipherOutputStream;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import static net.nanopay.fx.lianlianpay.model.DistributionMode.FIXED_SOURCE_AMOUNT;
import static net.nanopay.fx.lianlianpay.model.DistributionMode.FIXED_TARGET_AMOUNT;

public class LianLianPayService
    extends ContextAwareSupport
    implements LianLianPay
{
  protected static final int AES_KEY_SIZE = 256;
  protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  // decimal formatter for scale of 2
  protected static ThreadLocal<DecimalFormat> df2 = new ThreadLocal<DecimalFormat>() {
    @Override
    protected DecimalFormat initialValue() {
      return new DecimalFormat("#.00");
    }
  };

  // decimal formatter for scale of 8
  protected static ThreadLocal<DecimalFormat> df8 = new ThreadLocal<DecimalFormat>() {
    @Override
    protected DecimalFormat initialValue() {
      return new DecimalFormat("#.00000000");
    }
  };

  private static SecureRandom random_;
  private static SecureRandom getSecureRandom() throws NoSuchAlgorithmException {
    if ( random_ == null ) {
      random_ = SecureRandom.getInstance("SHA1PRNG");
    }
    return random_;
  }

  protected Provider provider_;
  protected PublicKey publicKey_;
  protected PrivateKey privateKey_;

  /**
   * Creates a new instance of LianLianPayService
   *
   * @param x context
   * @param pubKeyFilename public key filename
   * @param privKeyFilename private key filename
   * @throws IOException
   * @throws InvalidKeySpecException
   * @throws NoSuchAlgorithmException
   */
  public LianLianPayService(X x, String pubKeyFilename, String privKeyFilename)
      throws IOException, InvalidKeySpecException, NoSuchAlgorithmException
  {
    this(x, pubKeyFilename, privKeyFilename, new BouncyCastleProvider());
  }

  /**
   * Creates a new instance of LianLianPayService
   *
   * @param x context
   * @param pubKeyFilename public key filename
   * @param privKeyFilename private key filename
   * @param provider crypto provider
   * @throws IOException
   * @throws InvalidKeySpecException
   * @throws NoSuchAlgorithmException
   */
  public LianLianPayService(X x, String pubKeyFilename, String privKeyFilename, Provider provider)
      throws IOException, InvalidKeySpecException, NoSuchAlgorithmException
  {
    setX(x);
    provider_ = provider;
    publicKey_ = (PublicKey) readKey(pubKeyFilename, true, provider);
    privateKey_ = (PrivateKey) readKey(privKeyFilename, false, provider);
  }

  /**
   * Reads a Public/Private key from file
   *
   * @param filename file to read
   * @param isPublicKey flag to determine if public key or private key
   * @param provider crypto provider
   * @return a private key or public key
   * @throws IOException
   * @throws NoSuchAlgorithmException
   * @throws InvalidKeySpecException
   */
  protected Key readKey(String filename, boolean isPublicKey, Provider provider)
      throws IOException, NoSuchAlgorithmException, InvalidKeySpecException
  {
    byte[] keyBytes = Base64.decode(Files.readAllBytes(Paths.get(filename)));
    KeySpec spec = ( isPublicKey ) ?
        new X509EncodedKeySpec(keyBytes) :
        new PKCS8EncodedKeySpec(keyBytes);
    KeyFactory kf = KeyFactory.getInstance("RSA", provider);
    return ( isPublicKey ) ? kf.generatePublic(spec) : kf.generatePrivate(spec);
  }

  @Override
  public void uploadInstructionCombined(InstructionCombined request) {
    try {
      StringBuilder builder = sb.get();

      // generate random AES256 key
      KeyGenerator keygen = KeyGenerator.getInstance("AES", provider_);
      keygen.init(AES_KEY_SIZE, getSecureRandom());
      SecretKey key = keygen.generateKey();

      // generate cipher in encrypt mode using the public key
      Cipher cipher = Cipher.getInstance("RSA", provider_);
      cipher.init(Cipher.ENCRYPT_MODE, publicKey_);

      // encrypt aes256 key using public key
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      CipherOutputStream cos = new CipherOutputStream(baos, cipher);
      cos.write(key.getEncoded());
      cos.close();

      // append Base64 encoded random AES256 key encrypted by LianLian Pay RSA Public Key
      builder.append(Base64.toBase64String(baos.toByteArray())).append("\n");

      // append summary information separated by |
      InstructionCombinedSummary summary = request.getSummary();
      builder.append(summary.getBatchId()).append("|")
          .append(summary.getSourceCurrency()).append("|")
          .append(FIXED_SOURCE_AMOUNT.equals(summary.getDistributeMode()) ?
              df2.get().format(summary.getTotalSourceAmount()) : "|")
          .append(summary.getTargetCurrency()).append("|")
          .append(FIXED_TARGET_AMOUNT.equals(summary.getDistributeMode()) ?
              df2.get().format(summary.getTotalTargetAmount()) : "|")
          .append(summary.getTotalCount()).append("|")
          .append(((DistributionMode) summary.getDistributeMode()).getOrdinal()).append("|")
          .append(((InstructionType) summary.getInstructionType()).getOrdinal()).append("\n");

      // append instruction requests
      boolean headersOutput = false;
      InstructionCombinedRequest[] instructions = request.getRequests();
      for ( InstructionCombinedRequest instruction : instructions ) {
        List props = instruction.getClassInfo().getAxiomsByClass(PropertyInfo.class);
        // output headers before outputting first instruction
        if ( ! headersOutput ) {
          Iterator i = props.iterator();
          while ( i.hasNext() ) {
            PropertyInfo prop = (PropertyInfo) i.next();
            builder.append(prop.getName())
                .append(i.hasNext() ? "|" : "\n");
          }
          headersOutput = true;
        }

        builder.append(instruction.getOrderId()).append("|")
            .append(((InstructionType) instruction.getFundsType()).getOrdinal()).append("|")
            .append(instruction.getSourceCurrency()).append("|")
            .append(FIXED_SOURCE_AMOUNT.equals(summary.getDistributeMode()) ? instruction.getSourceAmount() : "").append("|")
            .append(instruction.getTargetCurrency()).append("|")
            .append(FIXED_TARGET_AMOUNT.equals(summary.getDistributeMode()) ? instruction.getTargetAmount() : "").append("|")
            .append(instruction.getPayeeCompanyName()).append("|")
            .append(instruction.getPayeeContactNumber()).append("|")
            .append(SafetyUtil.isEmpty(instruction.getPayeeSocialCreditCode()) ? instruction.getPayeeOrganizationCode() : "").append("|")
            .append(SafetyUtil.isEmpty(instruction.getPayeeOrganizationCode()) ? instruction.getPayeeSocialCreditCode() : "").append("|")
            .append(! SafetyUtil.isEmpty(instruction.getPayeeEmailAddress()) ? instruction.getPayeeEmailAddress() : "").append("|")
            .append(SafetyUtil.isEmpty(instruction.getPayeeBankBranchName()) ? instruction.getPayeeBankName() : "").append("|")
            .append(instruction.getPayeeBankName() == 0 ? instruction.getPayeeBankBranchName() : "").append("|")
            .append(instruction.getPayeeBankAccount()).append("|")
            .append(instruction.getPayerId()).append("|")
            .append(instruction.getPayerName()).append("|")
            .append(instruction.getTradeCode()).append("|")
            .append(! SafetyUtil.isEmpty(instruction.getMemo()) ? instruction.getMemo() : "").append("\n");
      }

      // TODO: upload to SFTP
      // TODO: sign all of the data
      // TODO: encrypt bank information
    } catch (Throwable t) {
      t.printStackTrace();
      throw new RuntimeException(t);
    }
  }

  @Override
  public PreProcessResult downloadPreProcessResult() {
    // TODO: download from SFTP

    String cwd = System.getProperty("user.dir");
    File file = new File(cwd +
        "/nanopay/src/net/nanopay/fx/lianlianpay/test/B2BSend_CombinedMode/2017.01.01/PreProcessResult/20170101_201701010000000001_000001.RESP");
    BufferedReader br = null;

    PreProcessResult result = new PreProcessResult();

    PreProcessResultSummary summary = new PreProcessResultSummary();
    List summaryProps = summary.getClassInfo().getAxiomsByClass(PropertyInfo.class);

    PreProcessResultResponse[] responses = null;
    List responseProps = PreProcessResultResponse.getOwnClassInfo().getAxiomsByClass(PropertyInfo.class);

    try {
      br = new BufferedReader(new FileReader(file));

      String line;
      int count = 0;
      while ( (line = br.readLine()) != null ) {
        if ( count == 0 ) {
          // read summary
          String[] strings = line.split("\\|", summaryProps.size());

          for ( int i = 0; i < summaryProps.size(); i++ ) {
            if ( SafetyUtil.isEmpty(strings[i]) ) continue;
            PropertyInfo prop = (PropertyInfo) summaryProps.get(i);
            prop.setFromString(summary, strings[i]);
          }
        } else if ( count > 1 ) {
          if ( responses == null ) {
            // initialize using original count length to get size
            responses = new PreProcessResultResponse[summary.getOriginalCount()];
          }

          // read response information
          PreProcessResultResponse response = new PreProcessResultResponse();
          String[] strings = line.split("\\|", responseProps.size());

          for ( int i = 0; i < responseProps.size(); i++ ) {
            if ( SafetyUtil.isEmpty(strings[i]) ) continue;
            PropertyInfo prop = (PropertyInfo) responseProps.get(i);
            prop.setFromString(response, strings[i]);
          }
          // count minus 2 to get proper index
          responses[count - 2] = response;
        }
        count++;
      }

      result.setSummary(summary);
      result.setResponses(responses);
      return result;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(br);
    }
  }

  @Override
  public Reconciliation downloadReconciliation() {
    // TODO: download from SFTP

    return null;
  }

  @Override
  public Statement downloadStatement() {
    // TODO: download from SFTP

    return null;
  }
}