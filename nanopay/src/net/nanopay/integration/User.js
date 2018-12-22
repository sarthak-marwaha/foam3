foam.CLASS({
  package: 'net.nanopay.integration',
  name: 'UserRefine',
  refines: 'foam.nanos.auth.User',
  properties: [
    {
      class: 'Int',
      name: 'integrationCode',
      value: -1,
      hidden: true,
    },
    {
      class: 'Boolean',
      name: 'hasIntegrated',
      value: false,
      hidden: true,
    },
  ]
});
