foam.CLASS({
  package: 'net.nanopay.msp',
  name: 'MspInfo',
  ids: ['spid'],

  documentation: 'The base model for the Multi Service Provider Setup.',

  properties: [
    {
      class: 'String',
      name: 'spid',
      validationPredicates: [
        {
          args: ['spid'],
          predicateFactory: function(e) {
            return e.REG_EXP(net.nanopay.msp.MspInfo.SPID, /^[a-z0-9]+$/);
          },
          errorString: 'Invalid character(s) in spid.'
        }
      ]
    },
    {
      class: 'String',
      name: 'adminUserEmail'
    },
    {
      class: 'Password',
      name: 'adminUserPassword'
    },
    {
      class: 'String',
      name: 'adminUserFirstname',
    },
    {
      class: 'String',
      name: 'adminUserLastname'
    },
    {
      class: 'List',
      name: 'domain'
    },
    {
      class: 'String',
      name: 'appName'
    },
    {
      class: 'String',
      name: 'description'
    }
  ]
});
