foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  documentation: `Hold Kotak Bank specific properties`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'fxRate',
      class: 'Double'
    },
    {
      class: 'Currency',
      name: 'settlementAmount'
    },
    {
      class: 'String',
      name: 'kotakMsgId'
    },
    {
      class: 'String',
      name: 'instRefNo',
      document: 'Instruction Reference Number'
    },
    {
      class: 'String',
      name: 'chargeBorneBy',
      documentation: 'BEN (Beneficiary), OUR (Payer), SHA(Shared)'
    },
    {
      class: 'DateTime',
      name: 'sentDate',
      documentation: 'Business date when the transaction was sent to Kotak'
    },
    {
      class: 'String',
      name: 'paymentStatusCode'
    },
    {
      class: 'String',
      name: 'paymentStatusRem',
      document: 'Status Remarks which contains status description'
    },
    {
      class: 'String',
      name: 'instStatusCd',
      document: 'Instrument Status Code'
    },
    {
      class: 'String',
      name: 'instStatusRem',
      document: 'Instrument Status Remarks'
    },
    {
      class: 'StringArray',
      name: 'errorList'
    },
    {
      class: 'String',
      name: 'errorCode'
    },
    {
      class: 'String',
      name: 'errorReason'
    },
    {
      class: 'String',
      name: 'invalidFieldName'
    },
    {
      class: 'String',
      name: 'invalidFieldValue'
    },
    {
      class: 'String',
      name: 'reversalReqId'
    },
    {
      class: 'String',
      name: 'reversalStatusCode'
    },
    {
      class: 'String',
      name: 'reversalStatusDesc'
    },
    {
      class: 'String',
      name: 'UTRNumber'
    }
  ],

  methods: [
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'Transfer[]',
      javaCode: `
      Transfer [] tr = new Transfer[] {};
      Account account = findSourceAccount(x);
      TrustAccount trustAccount = TrustAccount.find(x, account.findOwner(x), "INR");

      if ( getStatus() == TransactionStatus.PENDING ) {
        Transfer transfer = new Transfer.Builder(x)
                              .setDescription(trustAccount.getName()+" Cash-Out to INR Trust Account")
                              .setAccount(trustAccount.getId())
                              .setAmount(getSettlementAmount())
                              .build();
        tr = new Transfer[] {
          transfer,
          new Transfer.Builder(x)
            .setDescription("Cash-Out from CAD Digital Account")
            .setAccount(getSourceAccount())
            .setAmount(-getTotal())
            .build()
        };
      } else if ( getStatus() == TransactionStatus.DECLINED ) {
        Transfer transfer = new Transfer.Builder(x)
                              .setDescription(trustAccount.getName()+" Cash-Out DECLINED")
                              .setAccount(trustAccount.getId())
                              .setAmount(-getSettlementAmount())
                              .build();
        tr = new Transfer[] {
          transfer,
          new Transfer.Builder(x)
            .setDescription("Cash-Out DECLINED")
            .setAccount(getSourceAccount())
            .setAmount(getTotal())
            .build()
        };
      }

      add(tr);
      return getTransfers();
      `
    }
  ]
});
