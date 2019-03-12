foam.CLASS({
  package: 'net.nanopay.integration.xero.model',
  name: 'XeroContact',
  extends: 'net.nanopay.contacts.Contact',
  documentation: 'Class for Contacts imported from Xero Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'xeroId'
    },
    {
      class: 'Boolean',
      name: 'desync'
    },
    {
      class: 'Boolean',
      name: 'xeroUpdate',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'chooseBusiness',
      value: false,
      documentation: 'set this to true to let user manually select the business of this contact'
    }
  ]
});
