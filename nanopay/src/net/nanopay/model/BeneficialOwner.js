foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BeneficialOwner',

  documentation: `
    A beneficial owner is a person who owns part of a business.
  `,

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.HumanNameTrait'
  ],

  requires: [
    'foam.nanos.auth.Address'
  ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User'
  ],

  imports: [
    'complianceHistoryDAO'
  ],

  tableColumns: [
    'id',
    'business',
    'legalName'
  ],

  sections: [
    {
      name: 'requiredSection'
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'jobTitle',
      section: 'requiredSection',
      minLength: 1
    },
    {
      class: 'Int',
      name: 'ownershipPercent',
      section: 'requiredSection',
      documentation: `
        Represents the percentage of the business that the beneficial owner
        owns.
      `,
      autoValidate: true,
      min: 25,
      max: 100
    },
    {
      class: 'String',
      name: 'firstName',
      section: 'requiredSection',
      minLength: 1
    },
    {
      class: 'String',
      name: 'lastName',
      section: 'requiredSection',
      minLength: 1
    },
    'middleName',
    'legalName',
    {
      class: 'Date',
      name: 'birthday',
      section: 'requiredSection',
      validationPredicates: [
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            return foam.mlang.predicate.OlderThan.create({
              arg1: net.nanopay.model.BeneficialOwner.BIRTHDAY,
              timeMs: 18 * 365 * 24 * 60 * 60 * 1000
            });
          },
          errorString: 'Must be at least 18 years old.'
        }
      ]
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      section: 'requiredSection',
      factory: function() {
        return this.Address.create();
      },
      view: { class: 'net.nanopay.sme.ui.AddressView' },
      autoValidate: true
    },
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = (User) x.get("user");

        if ( auth.check(x, String.format("beneficialOwner.create.%d", this.getId())) ) return;

        if ( ! (user instanceof Business) ) {
          throw new AuthorizationException("Only businesses can have beneficial owners.");
        }

        if ( this.getBusiness() != user.getId() ) {
          throw new AuthorizationException("Permission denied: Cannot add beneficial owners to other businesses.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' },
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = (User) x.get("user");

        if ( auth.check(x, String.format("beneficialOwner.read.%d", this.getId())) ) return;

        if ( this.getBusiness() != user.getId() ) {
          throw new AuthorizationException("Permission denied: Cannot see beneficial owners owned by other businesses.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        if ( auth.check(x, String.format("beneficialOwner.update.%d", this.getId())) ) return;

        if ( this.getBusiness() != user.getId() ) {
          throw new AuthorizationException("Permission denied: Cannot edit beneficial owners owned by other businesses.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = (User) x.get("user");

        if ( auth.check(x, String.format("beneficialOwner.delete.%d", this.getId())) ) return;

        if ( this.getBusiness() != user.getId() ) {
          throw new AuthorizationException("Permission denied: Cannot remove beneficial owners owned by other businesses.");
        }
      `
    }
  ],
  actions: [
    {
      name: 'viewComplianceHistory',
      label: 'View Compliance History',
      availablePermissions: ['service.compliancehistorydao'],
      code: async function(X) {
        var m = foam.mlang.ExpressionsSingleton.create({});
        this.__context__.stack.push({
          class: 'foam.comics.BrowserView',
          createEnabled: false,
          editEnabled: true,
          exportEnabled: true,
          title: `${this.legalName}'s Compliance History`,
          data: this.complianceHistoryDAO.where(m.AND(
              m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_ID, this.id + ''), 
              m.EQ(foam.nanos.ruler.RuleHistory.OBJECT_DAO_KEY, 'beneficialOwnerDAO')
          ))
        });
      }
    }
  ]
});
