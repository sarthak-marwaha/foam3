foam.CLASS({
  package: 'net.nanopay.model',
  name: 'DateOnly',
  documentation: 'For the purpose of specifying static dates. No time associated with this.',
  properties: [
    {
      class: 'Int',
      name: 'year'
    },
    {
      class: 'Int',
      name: 'month'
    },
    {
      class: 'Int',
      name: 'day'
    }
  ],
  methods: [
    {
      name: 'toString',
      code: function() {
        return `${this.year}-${this.month}-${this.day}`;
      },
      javaCode: `
        return getYear() + "-" + getMonth() + "-" + getDay();
      `
    }
  ]

});

foam.CLASS({
  package: 'net.nanopay.model',
  name: 'DateOnlyProperty',
  extends: 'foam.core.FObjectProperty',
  documentation: 'For the purpose of specifying static dates. No time associated with this.',
  properties: [
    {
      class: 'Class',
      name: 'of',
      value: 'net.nanopay.model.DateOnly'
    },
    {
      name: 'view',
      value: {
        class: 'net.nanopay.model.DateOnlyView'
      }
    }
  ]
});
