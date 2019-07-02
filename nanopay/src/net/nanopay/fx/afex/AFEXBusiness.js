foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusiness',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user',
      documentation: `The ID for the user`
    },
    {
      class: 'String',
      name: 'apiKey',
      documentation: 'API Key for the business.'
    },
    {
      class: 'String',
      name: 'accountNumber',
      documentation: 'AFEX account number'
    },
    {
      class: 'String',
      name: 'status',
      documentation: 'Beneficiary status on AFEX system.'
    },
    {
      class: 'DateTime',
      name: 'created',
      label: 'Creation Date',
      documentation: 'Creation date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the entry'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy'
    }
  ]
});
