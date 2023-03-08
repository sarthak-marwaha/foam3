/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'VerificationCodeView',
  extends: 'foam.u2.View',

  documentation: 'view to enter email verification code',

  imports: [
    'pushMenu'
  ],

  requires: [
    'foam.u2.detail.SectionView'
  ],

  css: `
    ^ {
      height: 100%;
    }
    ^flex {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: start;
      gap: 3rem;
      padding-top: 5rem;
    }
    ^sectionView{
      width: 25%;
      display: flex;
      justify-content: center;
    }
    ^title {
        text-align:center;
    }
   /* mobile */
   @media only screen and (max-width: 767px) {
    ^sectionView{
      width: 100%;
    }
   }
  `,


  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.email.EmailVerificationCode',
      name: 'data'
    }
  ],

  methods: [
    function render() {
      this
        .addClass(this.myClass(), this.myClass('flex'))
        .start('h1').addClass(this.myClass('title')).add(this.data.TITLE).end()
        .start(this.SectionView, { data$: this.data$, sectionName: 'verificationCodeSection', showTitle: false })
        .addClass(this.myClass('sectionView')).end()
        .startContext({ data: this.data })
          .addClass(this.myClass('flex'))
          .start()
            .add(this.BACK)
          .end()
        .endContext();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Back to Sign In',
      buttonStyle: 'LINK',
      code: function(X) {
        X.pushMenu('sign-in', true);
      }
    }
  ]
});
