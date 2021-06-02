/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'BankToBankPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Planner for bank to bank transactions',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.LimitTransaction',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.CLASS_OF',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'java.util.ArrayList',
    'java.util.List',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'net.nanopay.fx.FXSummaryTransaction',
  ],

  properties: [
    {
      name: 'multiPlan_',
      value: true
    },
    {
      name: 'createCompliance',
      class: 'Boolean',
      value: true
    },
    {
      name: 'createUserCompliance',
      class: 'Boolean',
      value: false
    },
    {
      name: 'createLimit',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        Transaction txn;
        if ( SafetyUtil.equals(quote.getDestinationAccount().getDenomination(), quote.getSourceAccount().getDenomination() )) {
          txn = new SummaryTransaction(x);
        }
        else {
          txn = new FXSummaryTransaction(x);
        }
        txn.copyFrom(requestTxn);

        txn.setStatus(TransactionStatus.PENDING);
        txn.setInitialStatus(TransactionStatus.COMPLETED);
        if ( txn.getDestinationAmount() != 0 ) {
          txn.setAmount(txn.getDestinationAmount());
        }

        Account sourceAccount = quote.getSourceAccount();
        Account destinationAccount = quote.getDestinationAccount();
        DAO dao = (DAO) x.get("localAccountDAO");

        List digitals = ((ArraySink) dao.where(
          AND(
            EQ(Account.OWNER, sourceAccount.getOwner()),
            CLASS_OF(DigitalAccount.class)
          )).select(new ArraySink())).getArray();

        for ( Object obj : digitals ) {
          // Failing a digital plan for 1 account shouldn't fail planning
          try {
            DigitalAccount sourceDigitalAccount = (DigitalAccount) obj;

            // Split 1: ABank -> ADigital
            Transaction t1 = new Transaction(x);
            t1.copyFrom(txn);
            t1.setDestinationAccount(sourceDigitalAccount.getId());
            Transaction[] cashInPlans = multiQuoteTxn(x, t1, quote);

            for ( Transaction CIP : cashInPlans ) {
              // Split 2: ADigital -> BBank
              Transaction t2 = new Transaction(x);
              t2.copyFrom(txn);
              t2.setSourceAccount(sourceDigitalAccount.getId());
              //Note: if CIP, does not have all the transfers for getTotal this wont work.
              t2.setAmount(CIP.getTotal(x, sourceDigitalAccount.getId()));
              Transaction[] cashOutPlans = multiQuoteTxn(x, t2, quote);

              for ( Transaction COP : cashOutPlans ) {
                List<Transaction> chain = new ArrayList<Transaction>();
                
                // Transactions are added to chain in reverse execution order
                chain.add((Transaction) removeSummaryTransaction(COP).fclone());
                chain.add((Transaction) removeSummaryTransaction(CIP).fclone());
 
                // Optional transactions
                if (getCreateCompliance())
                  chain.add(createComplianceTransaction(txn));
                if ( getCreateUserCompliance() )
                  chain.add(createUserComplianceTransaction(txn));
                if ( getCreateLimit() )
                  chain.add(createLimitTransaction(txn));

                // Buld the tx chain in reverse order
                Transaction t = (Transaction) txn.fclone();
                Transaction last = t;
                for (int i = chain.size() - 1; i >= 0; i--) {
                  Transaction next = chain.get(i);
                  last.addNext(next);
                  last = next;
                }

                t.setStatus(TransactionStatus.COMPLETED);
                t.setPlanCost(t.getPlanCost() + CIP.getPlanCost() + COP.getPlanCost());
                quote.getAlternatePlans_().add(t);
              }
            }
          } catch (Exception e) {
          }
        }
        return null;
      `
    },
  ]
});