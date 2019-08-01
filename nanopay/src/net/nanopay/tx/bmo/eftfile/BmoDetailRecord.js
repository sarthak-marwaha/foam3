foam.CLASS({
  package: 'net.nanopay.tx.bmo.eftfile',
  name: 'BmoDetailRecord',

  documentation: `BMO EFT file, detail record - 'C' or 'D' (80 Character)`,

  javaImports: [
    'net.nanopay.tx.bmo.BmoFormatUtil',
    'java.time.LocalDate',
    'foam.nanos.logger.Logger'
  ],

  implements: [
    'foam.core.Validatable'
  ],

  properties: [
    {
      name: 'logicalRecordTypeId',
      class: 'String'
    },
    {
      name: 'amount',
      class: 'Long'
    },
    {
      name: 'clientInstitutionId',
      class: 'String',
      documentation: 'payee / payor institution ID, pattern: 0BBBTTTTT, '
    },
    {
      name: 'clientAccountNumber',
      class: 'String',
      documentation: 'payee / payor account number'
    },
    {
      name: 'clientName',
      class: 'String'
    },
    {
      name: 'referenceNumber',
      class: 'String',
      documentation: 'Cross reference number, customer ID to reference item. e.g. Employee SIN number.'
    }
  ],

  methods: [
    {
      name: 'toBmoFormat',
      type: 'String',
      javaCode:
      `
      return this.getLogicalRecordTypeId()
        + BmoFormatUtil.addLeftZeros(this.getAmount(), 10)
        + "0" + this.getClientInstitutionId()
        + BmoFormatUtil.addRightBlanks(this.getClientAccountNumber(), 12)
        + BmoFormatUtil.addRightBlanks(this.getClientName(), 29)
        + BmoFormatUtil.addRightBlanks(this.getReferenceNumber(), 19);
      `
    },
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaCode: `
      if ( this.getAmount() > 9999999999L ) {
        throw new RuntimeException("Transaction amount is larger than the max.");
      }
      
      if ( this.getClientName().length() > 29 ) {
        ((Logger)x.get("logger")).warning("User name is longer than 19 char.");
        this.setClientName(this.getClientName().substring(0, 29));
      }
  
      if ( this.getReferenceNumber().length() > 19 ) {
        throw new RuntimeException("Transaction reference number is longer than 19 char.");
      }
      `
    },
  ]
});
