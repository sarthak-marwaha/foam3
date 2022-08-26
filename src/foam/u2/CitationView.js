/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'CitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  css: `
    ^row {
      font-size: 1.2rem;
    }

    ^rw {
      background: /*%WHITE%*/ white;
      padding: 8px 16px;
      color: /*%BALCK%*/ #424242;
    }

    ^rw:hover {
      background: /*%GREY5%*/ #f4f4f9;
      cursor: pointer;
    }
  `,

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'summary'
    }
  ],

  reactions: [
    ['', 'propertyChange.data', 'updateSummary'],
    ['data', 'propertyChange', 'updateSummary']
  ],

  listeners: [
    {
      name: 'updateSummary',
      isFramed: true,
      code: async function() {
        let newSummary;

        if ( this.data ) {
          var summary = this.getSummary(this.data);

          newSummary = summary instanceof Promise
            ? await summary
            : summary;
        } else {
          newSummary = undefined;
        }

        this.summary = newSummary;
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      this.updateSummary();
      this
        .addClass(this.myClass('row')).style({ 'margin': this.margin })
        .enableClass(this.myClass('rw'), this.mode$.map(m => m === foam.u2.DisplayMode.RW))
        .add(this.summary$);
    },

    function getSummary(data) {
      return data.toSummary?.();
    }
  ]
});
