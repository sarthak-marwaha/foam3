foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'IsInstancePredicate',

  documentation: 'Returns true if new object is instanceof of',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'static foam.mlang.MLang.*'
  ],
  properties: [
    {
      class: 'Class',
      name: 'of',
      documentation: 'class that we want the object to be an instance of'
    }
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, INSTANCE_OF(getOf().getObjClass())), true
        ).f(obj);
      `
    }
  ]
});
