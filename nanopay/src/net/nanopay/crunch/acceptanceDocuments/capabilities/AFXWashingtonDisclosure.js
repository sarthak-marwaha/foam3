foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'AFXWashingtonDisclosure',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'ACKNOWLEDGE_DISCLOSURE', message: 'Must acknowledge the Disclosure.' }
  ],

  properties: [
    {
      name: 'title',
      value: 'AFX Washington Disclosure'
    },
    {
      name: 'checkboxText',
      value: 'I agree to '
    },
    {
      name: 'country',
      value: 'US'
    },
    {
      name: 'state',
      value: 'WA'
    },
    {
      name: 'transactionType',
      value: 'AscendantFXTransaction'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .AFXWashingtonDisclosure.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_DISCLOSURE'
        }
      ]
    }
  ]
});
