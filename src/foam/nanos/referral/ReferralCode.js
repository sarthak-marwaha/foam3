/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.referral',
  name: 'ReferralCode',

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil'
  ],

  messages: [
    {
      name: 'LACKS_CREATE_PERMISSION',
      message: 'You do not have permission to create a referral code'
    },
    {
      name: 'LACKS_READ_PERMISSION',
      message: 'You do not have permission to read this referral code'
    },
    {
      name: 'LACKS_UPDATE_PERMISSION',
      message: 'You do not have permission to update this referral code'
    },
    {
      name: 'LACKS_REMOVE_PERMISSION',
      message: 'You do not have permission to remove this referral code'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'spid',
      permissionRequired: true,
      columnPermissionRequired: true
    },
    {
      class: 'String',
      name: 'url',
      label: 'Referral Link'
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! auth.check(x, "referralCode.create") ) {
        throw new AuthorizationException(LACKS_CREATE_PERMISSION);
      }
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      User user = ((Subject) x.get("subject")).getUser();
      if (  user == null || ( ! auth.check(x, "referralCode.read." + getId()) && ! SafetyUtil.equals(user.getId(), getReferrer())) ) {
        throw new AuthorizationException(LACKS_READ_PERMISSION);
      }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      User user = ((Subject) x.get("subject")).getUser();
      if (  user == null || ( ! auth.check(x, "referralCode.update." + getId()) && ! SafetyUtil.equals(user.getId(), getReferrer()) ) ) {
        throw new AuthorizationException(LACKS_UPDATE_PERMISSION);
      }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! auth.check(x, "referralCode.remove." + getId()) ) {
        throw new AuthorizationException(LACKS_REMOVE_PERMISSION);
      }
      `
    }
  ]
});

/* Relationship between the creator and referralCode. The creator can create multiple
  referralCodes, each code would be for a specific application/feature. */
foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.referral.ReferralCode',
  forwardName: 'referralCodes',
  inverseName: 'referrer',
  cardinality: '1:*',
  targetProperty: {
    permissionRequired: true,
    columnPermissionRequired: true
  }
});

/* Relationship between a referralCode and a user that signs up using that code.
  A user can only sign up using one referralCode*/
foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.referral.ReferralCode',
  targetModel: 'foam.nanos.auth.User',
  forwardName: 'referees',
  inverseName: 'referralCode',
  cardinality: '1:*',
  sourceProperty: {
    permissionRequired: true,
    columnPermissionRequired: true
  }
});
