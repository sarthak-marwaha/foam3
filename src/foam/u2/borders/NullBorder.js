/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'NullBorder',
  extends: 'foam.u2.Element',

  documentation: `
    An unstyled border. Intended for use as a default value for
    border properties.
  `,

  properties: [
    {
      class: 'StringArray',
      name: 'cssClasses'
    },
  ],

  methods: [
    function init() {
      this.startContext({ controllerMode: foam.u2.ControllerMode.VIEW })
      .addClass(...this.cssClasses)
      .tag('', {}, this.content$)
      .endContext();
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'BorderTest',
  extends: 'foam.u2.View',
  documentation: '',
  css: ``,
  properties: [
    {
      class: 'String',
      name: 'test'
    }
  ],
  methods: [
    function render() {
      this.start(foam.u2.borders.NullBorder)
      .startContext({ data: this })
        .tag(this.TEST.__)
        .add(this.TEST.__)
        .endContext()
      .end();
    }
  ]
});
