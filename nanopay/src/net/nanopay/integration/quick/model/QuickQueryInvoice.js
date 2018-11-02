foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryInvoice',
  properties: [
    {
      class: 'String',
      name: 'Id'
    },
    {
      class: 'String',
      name: 'TxnDate'
    },
    {
      class: 'String',
      name: 'DueDate'
    },
    {
      class: 'String',
      name: 'DocNumber'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryCurrencyReference',
      name: 'CurrencyRef'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryNameValue',
      name: 'CustomerRef'
    },
    {
      class: 'Double',
      name: 'TotalAmt'
    },
    {
      class: 'Double',
      name: 'Balance'
    },
  ]
});
