foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'PropertyEQValue',

  documentation: 'A predicate that returns true when a specific property equals the provided value on either the new or old object.',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*'
  ],
  properties: [
    {
      class: 'String',
      name: 'propName'
    },
    {
      class: 'Object',
      name: 'propValue'
    },
    {
      class: 'Boolean',
      name: 'isNew',
      value: true
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( getIsNew() ) {
          FObject nu  = (FObject) NEW_OBJ.f(obj);
          return EQ(nu.getClassInfo().getAxiomByName(getPropName()), getPropValue()).f(nu);
        }
        else {
          FObject old = (FObject) OLD_OBJ.f(obj);
          return EQ(old.getClassInfo().getAxiomByName(getPropName()), getPropValue()).f(old);
        }
      `
    }
  ]
});
