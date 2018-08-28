foam.CLASS({
    package: 'net.nanopay.fx',
    name: 'FXQuote',
    properties: [{
            class: 'foam.core.Date',
            name: 'expiryTime'
        },
        {
            class: 'Long',
            name: 'id',
            documentation: 'Refers to the'
        },
        {
            class: 'String',
            name: 'externalId',
            documentation: 'Refers to the FX Provider Quote Identifier'
        },
        {
            class: 'foam.core.Date',
            name: 'quoteDateTime'
        },
        {
            class: 'String',
            name: 'status'
        },
        {
          class: 'Reference',
          of: 'net.nanopay.model.Currency',
          name: 'sourceCurrency'
        },
        {
          class: 'Reference',
          of: 'net.nanopay.model.Currency',
          name: 'targetCurrency'
        }
    ]
});
