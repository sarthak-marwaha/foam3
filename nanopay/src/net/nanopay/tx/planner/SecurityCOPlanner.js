foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'SecurityCOPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'A planner for ingesting securities',

  javaImports: [
    'net.nanopay.tx.SecurityTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.SecuritiesAccount',
    'net.nanopay.account.SecuritiesTrustAccount',
    'foam.dao.DAO',
  ],

  properties: [
    {
      name: 'securityTrustId',
      class: 'Long',
      value: 21
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

        SecurityTransaction secTx = new SecurityTransaction();
        secTx.copyFrom(requestTxn);

        DAO accountDAO = (DAO) x.get("localAccountDAO");
        SecuritiesTrustAccount secTrust = (SecuritiesTrustAccount) accountDAO.find(getSecurityTrustId());
        Long transferAccount = ((SecuritiesAccount) quote.getSourceAccount()).getSecurityAccount(x, quote.getSourceUnit()).getId();
        secTx.setDestinationAmount(secTx.getAmount());
        secTx.setName("Security CO of "+quote.getSourceUnit());

        quote.addTransfer(transferAccount, -secTx.getAmount());
        quote.addTransfer(secTrust.getSecurityAccount(x,quote.getSourceUnit()).getId(), secTx.getAmount());

        return secTx;
      `
    }
  ]
});
