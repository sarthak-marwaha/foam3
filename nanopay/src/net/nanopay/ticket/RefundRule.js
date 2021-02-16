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
  package: 'net.nanopay.ticket',
  name: 'RefundRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to refund transaction`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.fs.File',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.ticket.RefundStatus',
    'net.nanopay.tx.CreditLineItem',
    'net.nanopay.tx.FeeSummaryTransactionLineItem',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.ArrayList',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.CLASS_OF',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          
          RefundTicket request = (RefundTicket) obj;
          DAO txnDAO = (DAO) x.get("localTransactionDAO");

          Transaction reverse = request.getRequestTransaction();

          Transaction problemTxn = (Transaction) txnDAO.inX(x).find(request.getProblemTransaction()).fclone();
          ArrayList<TransactionLineItem> array = new ArrayList<TransactionLineItem>();

          if ( request.getRefundOldFees() ) {
            FeeSummaryTransactionLineItem feeSummary = null;
            for ( TransactionLineItem lineItem : reverse.getLineItems() ) {
              if ( lineItem instanceof FeeSummaryTransactionLineItem ) {
                feeSummary = (FeeSummaryTransactionLineItem) lineItem;
                break;
              }
            }
            CreditLineItem feeRefund = new CreditLineItem();
            feeRefund.setAmount(feeSummary.getAmount());
            feeRefund.setFeeCurrency(feeSummary.getCurrency());
            feeRefund.setSourceAccount(request.getCreditAccount());
            array.add(feeRefund);
          }

          if ( request.getCreditAmount() > 0 ) {
            CreditLineItem feeRefund = new CreditLineItem();
            feeRefund.setAmount(request.getCreditAmount());
            feeRefund.setFeeCurrency(reverse.findSourceAccount(x).getDenomination());
            feeRefund.setSourceAccount(request.getCreditAccount());
            array.add(feeRefund);
          }

          if ( array.size() > 0 ) {
            reverse.setLineItems(array.toArray(new TransactionLineItem[array.size()]));
          }

          try {
            problemTxn.setStatus(TransactionStatus.CANCELLED);
            txnDAO.inX(x).put(problemTxn);
          }
          catch (Exception e) {
          // transaction was not set to cancelled.
          // if declined
          }
          txnDAO.inX(x).put(reverse);

          request.setRefundStatus(RefundStatus.PROCESSING);
        }
     
      }, "Rule to submit the reverse transaction.");
      `
    }
  ]

});
