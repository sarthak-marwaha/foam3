foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakCOTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Hold Kotak Bank specific properties`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.account.TrustAccount'
  ],

  properties: [
    {
      name: 'fxRate',
      class: 'Double'
    },
    {
      class: 'UnitValue',
      name: 'settlementAmount'
    },
    {
      class: 'String',
      name: 'kotakMsgId'
    },
    {
      class: 'String',
      name: 'IFSCCode'
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
      documentation: 'Status Remarks which contains status description'
    },
    {
      class: 'String',
      name: 'queryReqId'
    },
    {
      class: 'String',
      name: 'queryStatusCode'
    },
    {
      class: 'String',
      name: 'queryStatusDesc'
    },
    {
      class: 'String',
      name: 'UTRNumber'
    },
    {
      name: 'initialStatus',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    }
  ],

  methods: [
    {
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
      return false;
      `
    },
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      super.limitedCopyFrom(other);
      setAmount(((KotakCOTransaction) other).getAmount());
      setLineItems(((KotakCOTransaction) other).getLineItems());
      `
    },
    {
      name: 'getPurposeCode',
      type: 'String',
      javaCode: `
      for ( TransactionLineItem item : getLineItems() ) {
        if ( item instanceof PurposeCodeLineItem ) {
          return ((PurposeCodeLineItem) item).getPurposeCode();
        }
      }
      return "P1099";
      `
    },
    {
      name: 'getAccountRelationship',
      type: 'String',
      javaCode: `
      for ( TransactionLineItem item : getLineItems() ) {
        if ( item instanceof AccountRelationshipLineItem ) {
          return ((AccountRelationshipLineItem) item).getAccountRelationship();
        }
      }
      return "Employee";
      `
    }
  ]
});
