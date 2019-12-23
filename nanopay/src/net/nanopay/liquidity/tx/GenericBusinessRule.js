foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'GenericBusinessRule',
  extends: 'net.nanopay.liquidity.tx.BusinessRule',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'Generic Business Rule.',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.tx.*',
    'foam.mlang.*',
    'foam.mlang.expr.*',
    'foam.mlang.predicate.*',
    'foam.mlang.MLang.*'
  ],

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.expr.PropertyExpr',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Neq',
    'net.nanopay.account.Account'
  ],

  searchColumns: [
    'id',
    'enabled',
    'businessRuleAction',
    'createdBy',
    'description'
  ],

  properties: [
    { name: 'id' },
    { name: 'description' },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'sourcePredicate',
      label: 'Source Condition',
      section: 'basicInfo',
      factory: function() {
        return this.EQ(Account.NAME, 'Source Account');
      },
      javaFactory: `
        return MLang.EQ(Account.NAME, "Source Account");
      `
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'destinationPredicate',
      label: 'Destination Condition',
      section: 'basicInfo',
      factory: function() {
        return this.EQ(this.Account.NAME, 'Destination Account');
      },
      javaFactory: `
        return MLang.EQ(Account.NAME, "Destination Account");
      `
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.tx.BusinessRuleAction',
      name: 'businessRuleAction',
      section: 'basicInfo',
      label: 'Action Type',
      tableWidth: 125
    },
    {
      name: 'ruleGroup',
      value: 'businessRules',
      hidden: true
    },
    {
      name: 'predicate',
      transient: true,
      hidden: true,
      javaGetter: `
        return foam.mlang.MLang.AND(
          (new BusinessRuleTransactionPredicate.Builder(getX())).setIsSourcePredicate(true).setPredicate(this.getSourcePredicate()).build(), 
          (new BusinessRuleTransactionPredicate.Builder(getX())).setIsSourcePredicate(false).setPredicate(this.getDestinationPredicate()).build());
      `
    },
    {
      name: 'action',
      transient: true,
      hidden: true,
      javaGetter: `
        // RESTRICT
        if (this.getBusinessRuleAction() == BusinessRuleAction.RESTRICT)
          return new ExceptionRuleAction.Builder(getX()).setMessage(this.getId() + " restricting operation. " + this.getDescription()).build();

        // NOTIFY
        if (this.getBusinessRuleAction() == BusinessRuleAction.NOTIFY)
          return new BusinessRuleNotificationAction.Builder(getX())
            .setBusinessRuleId(this.getId())
            .setGroupId("liquidDev")
            .build();

        // ALLOW
        return null;
      `,
    }
  ]
});
