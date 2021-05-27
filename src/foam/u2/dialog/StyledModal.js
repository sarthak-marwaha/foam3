/*
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2.dialog',
  name: 'ModalStyles',

  values: [
    {
      name: 'DEFAULT',
      color: ''
    },
    {
      name: 'DESTRUCTIVE',
      color: '/*%DESTRUCTIVE3%*/ #D9170E'
    },
    {
      name: 'WARN',
      color: '/*%WARNING3%*/ #EEDC00'
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.dialog',
  name: 'StyledModal',
  extends: 'foam.u2.dialog.Popup',
  documentation: `
    This view is a simple styled modal with a title and ability to add content/strings and actions
  `,

  imports: ['returnExpandedCSS', 'theme?'],

  requires: ['foam.u2.dialog.ModalStyles', 'foam.u2.layout.Rows'],

  css: `
    ^top{
      top: 2vh;
      position: absolute;
    }
    ^colorBar{
      width: 100%;
      height: 8px;
      z-index: 3;
      border-radius: 3px 3px 0 0;
    }
    ^inner {
      border: 1px solid /*%GREY4%*/ #DADDE2;
      border-top: none;
      background-color: /*%WHITE%*/ white;
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);
      border-radius: 0 0 3px 3px;
      overflow: hidden;
      padding: 24px;
      padding-bottom: 0px; 
      display: flex;
      flex-direction: column;
    }
    ^modal-body{
      overflow: auto;
      height: 100%;
      position: relative;
    }
    ^title{
      padding-bottom: 16px;
      margin-right: 40px;
    }
    ^actionBar {
      padding: 16px 0px;
      display: flex;
      justify-content: flex-end;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'maxHeight',
      value: '65'
    },
    {
      class: 'Int',
      name: 'maxWidth',
      value: '45'
    },
    {
      class: 'Enum',
      of: 'foam.u2.dialog.ModalStyles',
      name: 'modalStyle',
      value: 'DEFAULT',
      documentation: 'Setting modal styles adds a coloured bar at the top of the modal'
    },
    {
      name: 'isStyled',
      value: true,
      documentation: 'Can be used to turn off all styling for modal container'
    },
    {
      name: 'title',
      class: 'String'
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'actionArray',
      documentation: 'Can be used to specify additional actions. Designed to be used when there are no primary/secondaryActions'
    },
    {
      class: 'Boolean',
      name: 'isTop',
      value: false,
      documentation: 'Positions the modal to the top of the screen'
    }
  ],

  methods: [
    function init() {
      this
        .addClass(this.myClass())
        .on('keydown', this.onKeyDown)
        .start()
          .addClass(this.myClass('background'))
          .on('click', this.closeable ? this.close : null)
        .end()
        .start(this.Rows)
          .enableClass(this.myClass('top'), this.isTop$)
          .start()
              .enableClass(this.myClass('colorBar'), this.isStyled$)
              //TODO: Figure out why this can't use the returnExpandedCSS function
              .style({ background: this.modalStyle.color })
          .end()
          .start()
            .style({ 'max-height': this.maxHeight+'vh', 'max-width': this.maxWidth+'vw' })
            .enableClass(this.myClass('inner'), this.isStyled$)
            .startContext({ data: this })
              .start(this.CLOSE_MODAL, { buttonStyle: 'TERTIARY' }).show(this.closeable$)
                .addClass(this.myClass('X'))
              .end()
            .endContext()
            .start().addClasses(['h400', this.myClass('title')]).add(this.title).end()
            .start()
              .addClass(this.myClass('modal-body'))
              .tag('', null, this.content$)
            .end()
            .start()
              .addClass(this.myClass('actionBar'))
              .add(this.addActions())
            .end()
          .end()
        .end();
    },
    function addActions() {
      var actions = this.E().startContext({ data: this });
      for ( action of this.actionArray ) {
        actions.tag(action);
      }
      return actions.endContext();
    }
  ]

});
