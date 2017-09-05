foam.CLASS({
  package: 'net.nanopay.interac.ui.shared',
  name: 'FixedFloatView',
  extends: 'foam.u2.FloatView',

  documentation: 'View to display a float view with fixed precision with trailing zeros.',

  methods: [
    function formatNumber(val) {
      val = val.toFixed(this.precision);
      return val;
    }
  ]
});
