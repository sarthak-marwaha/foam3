foam.CLASS({
  package: 'net.nanopay.account.ui',
  name: 'AccountTreeView',
  extends: 'foam.u2.Element',

  requires: [
    'net.nanopay.account.ui.AccountTreeGraph'
  ],

  documentation: `
    A customized Tree View for accounts based on the Liquid design
  `,

  css: `
    ^header {
      border-bottom: solid 1px #e7eaec;
      height: 39px;
      width: 100%;
      text-align: center;
      padding-top: 12px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
      color: #1e1f21;
    }
  `,

  messages: [
    {
      name: 'VIEW_HEADER',
      message: 'ACCOUNT HIERARCHY VIEW',
    },
  ],

  methods: [
      function initE(){
        this.addClass(this.myClass());
        this.start().addClass(this.myClass('header')).add(this.VIEW_HEADER).end();
        this.tag(this.AccountTreeGraph);
      }
  ],
});
