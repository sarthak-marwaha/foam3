/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'NanopayTransactionFeeDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.mlang.MLang',

    'net.nanopay.tx.model.TransactionFee',
    'net.nanopay.tx.FeeTransfer',
    'net.nanopay.tx.model.Transaction',

    'java.util.List'
  ],

  properties: [
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      TransactionQuote quote = (TransactionQuote) obj;

      for ( int i = 0; i < quote.getPlans().length; i++ ) {
        TransactionPlan plan = quote.getPlans()[i];
        Transaction transaction = (Transaction) plan.getTransaction();
        if ( null != transaction ) {
          DAO transactionFeesDAO = (DAO) x.get("transactionFeesDAO");
          List applicableFees = ((ArraySink) transactionFeesDAO
              .where(MLang.AND(
                  MLang.EQ(TransactionFee.TRANSACTION_CLASS, transaction.getClass().getSimpleName()),  // TODO: Fix Transaction.getCls()
                  MLang.EQ(TransactionFee.FEE_CURRENCY, transaction.getSourceCurrency()),
                  MLang.LTE(TransactionFee.MIN_AMOUNT, transaction.getAmount()),
                  MLang.OR(
                      MLang.GTE(TransactionFee.MAX_AMOUNT, transaction.getAmount()),
                      MLang.EQ(TransactionFee.MAX_AMOUNT, 0)
                  )
              ))
              .select(new ArraySink())).getArray();

          if ( applicableFees.size() > 0 ) {
            for (Object applicableFee : applicableFees) {
              TransactionFee fee = (TransactionFee) applicableFee;
              if ( fee.getFee().getIsPassThroughFee() ) continue;
              Long feeAccount = fee.getFeeAccount();
              if ( feeAccount > 0 && fee.getFee().getFee(transaction.getAmount()) > 0 ) {
                FeeTransfer[] tr = new FeeTransfer [] {
                  new FeeTransfer.Builder(x).setAccount(transaction.getSourceAccount())
                      .setAmount(-fee.getFee().getFee(transaction.getAmount())).build(),
                  new FeeTransfer.Builder(x).setAccount(feeAccount)
                      .setAmount(fee.getFee().getFee(transaction.getAmount())).build()
                };
                transaction.add(tr);
                plan.setTransaction(transaction);
                quote.getPlans()[i] =  plan;
              }
            }
          }
        }
      }
      return super.put_(x, quote);
    `
    },
  ]
});
