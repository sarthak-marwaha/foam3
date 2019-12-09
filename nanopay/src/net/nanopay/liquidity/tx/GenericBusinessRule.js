foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'GenericBusinessRule',
  extends: 'net.nanopay.liquidity.tx.BusinessRule',

  documentation: 'Generic Business Rule.',

  javaImports: [
    'net.nanopay.liquidity.tx.*',
    'foam.mlang.*',
    'foam.mlang.expr.*',
    'foam.mlang.predicate.*',
    'foam.mlang.MLang.*',
    'net.nanopay.account.Account'
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
        var expr = this.PropertyExpr.create({
          property: this.Account.NAME
        });
        var cons = this.Constant.create({
          value: "Source Account"
        });
        var pred = this.Eq.create({
          arg1: expr,
          arg2: cons
        });
        return pred;
      },
      javaFactory: `
        return new Eq.Builder(getX())
          .setArg1(new PropertyExpr.Builder(getX())
            .setProperty(Account.NAME)
            .build())
          .setArg2(new Constant.Builder(getX())
            .build())
          .build();
      `
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'destinationPredicate',
      label: 'Destination Condition',
      section: 'basicInfo',
      factory: function() {
        var expr = this.PropertyExpr.create({
          property: this.Account.NAME
        });
        var cons = this.Constant.create({
          value: "Destination Account"
        });
        var pred = this.Eq.create({
          arg1: expr,
          arg2: cons
        });
        return pred;
      },
      javaFactory: `
        return new Eq.Builder(getX())
          .setArg1(new PropertyExpr.Builder(getX())
            .setProperty(Account.NAME)
            .build())
          .setArg2(new Constant.Builder(getX())
            .build())
          .build();
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
          return new BusinessRuleNotificationAction.Builder(getX()).setBusinessRuleId(this.getId()).build();  // TODO - add proper configuration for this email address

        // APPROVAL - TODO

        // ALLOW
        return null;
      `,
    }
  ]
});
