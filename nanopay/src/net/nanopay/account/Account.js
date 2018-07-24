foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Account',

  documentation: 'Base model of all Accounts',

  // relationships: owner (User)

  javaImports: [
    'foam.dao.DAO'
  ],

  imports: [
    'balanceDAO'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'desc',
      label: 'Description'
    },
    {
      class: 'Boolean',
      name: 'transferIn',
      value: true
    },
    {
      class: 'Boolean',
      name: 'transferOut',
      value: true
    },
    {
      documentation: `
          Unit of measure of the balance - such as Currency. The value of the
          denomination is the currency code, for example.
      `,
      class: 'String',
      name: 'denomination'
    },
    {
      class: 'Boolean',
      name: 'isDefault',
      label: 'Set As Default',
      value: false
    },
    // TODO: access/scope: public, private
    {
      class: 'String',
      name: 'type',
      transient: true,
      visibility: foam.u2.Visibility.RO,
      factory: function() {
        return this.cls_.name;
      },
      javaFactory: `
        return getClass().getSimpleName();
`
    }
  ],

  methods: [
    {
      name: 'findBalance',
      code: function(x) {
        return x.balanceDAO.find(this.id).then(function(balance) {
          if ( balance != null ) {
            console.debug('Balance found for account', this.id);
            return balance.balance;
          } else {
            console.debug('Balance not for found for account', this.id);
          }
          return null;
        }.bind(this));
      },
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'Object',
      javaCode: `
        DAO balanceDAO = (DAO) x.get("localBalanceDAO");
        Balance balance = (Balance) balanceDAO.find(this.getId());
        if ( balance != null ) {
          ((foam.nanos.logger.Logger) getX().get("logger")).debug("Balance found for account", this.getId());
          return balance.getBalance();
        } else {
          ((foam.nanos.logger.Logger) getX().get("logger")).debug("Balance not found for account", this.getId());
        }
        return null;
      `
    }
  ]
});
