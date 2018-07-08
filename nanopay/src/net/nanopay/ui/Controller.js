foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'Controller',
  extends: 'foam.nanos.controller.ApplicationController',

  documentation: 'Nanopay Top-Level Application Controller.',

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.util.AddCommaFormatter',
    'net.nanopay.util.CurrencyFormatter',
    'net.nanopay.util.FormValidation'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.invoice.ui.style.InvoiceStyles',
    'net.nanopay.account.CurrentBalance',
    'net.nanopay.model.Currency',
    'net.nanopay.ui.modal.ModalStyling',
    'net.nanopay.ui.style.AppStyles'
  ],

  exports: [
    'appConfig',
    'as ctrl',
    'currentBalance',
    'currentBalance as account',
    'currentCurrency',
    'findCurrentBalance',
    'privacyUrl',
    'termsUrl'
  ],

  css: `
    .stack-wrapper {
      /* 70px for topNav || 20px for padding || 40px for footer */
      min-height: calc(100% - 70px - 20px - 40px) !important;
      padding: 10px 0;
      margin-bottom: 0 !important;
    }

    .stack-wrapper:after {
      content: "";
      display: block;
    }

    .foam-comics-DAOUpdateControllerView .property-transactionLimits .net-nanopay-ui-ActionView-addItem {
      height: auto;
      padding: 3px;
      width: auto;
    }

    .foam-comics-DAOControllerView .foam-u2-view-TableView-row {
      height: 40px;
    }

    .foam-u2-view-TableView .net-nanopay-ui-ActionView {
      height: auto;
      padding: 8px;
      width: auto;
    }
    .net-nanopay-ui-ActionView-exportButton {
      float: right;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      width: 75px !important;
      height: 40px;
      cursor: pointer;
      z-index: 100;
      margin-right: 5px;
    }
    .net-nanopay-ui-ActionView-exportButton img {
      margin-right: 5px;
    }
  `,

  properties: [
    'privacyUrl',
    'termsUrl',
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.account.CurrentBalance',
      name: 'currentBalance',
      factory: function() { return this.CurrentBalance.create(); }
    },
    {
      name: 'appConfig'
    },
    {
      class: 'String',
      name: 'currentCurrency',
      factory: function () {
        return ( localStorage.currency ) ?
          localStorage.currency : 'CAD';
      }
    },
  ],

  methods: [
    function initE() {
      var self = this;
      self.clientPromise.then(function() {
        self.client.nSpecDAO.find('appConfig').then(function(config){
          self.appConfig = config.service;
        });

        self.AppStyles.create();
        self.InvoiceStyles.create();
        self.ModalStyling.create();

        foam.__context__.register(net.nanopay.ui.ActionView, 'foam.u2.ActionView');

        self.findCurrentBalance();

        self
          .addClass(self.myClass())
          .tag({class: 'foam.nanos.u2.navigation.TopNavigation' })
          .start('div').addClass('stack-wrapper')
            .tag({class: 'foam.u2.stack.StackView', data: self.stack, showActions: false})
          .end()
          .tag({class: 'net.nanopay.ui.FooterView'});
      });
    },

    function getCurrentUser() {
      var self = this;

      // get current user, else show login
      this.client.auth.getCurrentUser(null).then(function (result) {
        self.loginSuccess = !! result;
        if ( result ) {
          self.user.copyFrom(result);

          // only show B2B onboarding if user is a Business
          if ( self.user.type === 'Business' ) {
            // check account status and show UI accordingly
            switch ( self.user.status ) {
              case self.AccountStatus.PENDING:
                self.loginSuccess = false;
                self.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard' });
                return;

              case self.AccountStatus.SUBMITTED:
                self.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard', startAt: 5 });
                self.loginSuccess = false;
                return;

              case self.AccountStatus.DISABLED:

                // If the user submitted the form before their account was
                // disabled but before it was activated, they should see page
                // 5 of the onboarding wizard to be able to review what they
                // submitted.
                if ( self.user.previousStatus === self.AccountStatus.SUBMITTED ) {
                  self.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard', startAt: 5 });

                // Otherwise, if they haven't submitted yet, or were already
                // activated, they shouldn't need to be able to review their
                // submission, so they should just see the simple "account
                // disabled" view.
                } else {
                  self.stack.push({ class: 'net.nanopay.admin.ui.AccountRevokedView' });
                }
                self.loginSuccess = false;
                return;

              // show onboarding screen if user hasn't clicked "Go To Portal" button
              case self.AccountStatus.ACTIVE:
                if ( !self.user.createdPwd ) {
                  self.loginSuccess = false;
                  self.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard', startAt: 6 });
                  return;
                }
                if ( self.user.onboarded ) break;
                self.loginSuccess = false;
                self.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard', startAt: 5 });
                return;

              case self.AccountStatus.REVOKED:
                self.loginSuccess = false;
                self.stack.push({ class: 'net.nanopay.admin.ui.AccountRevokedView' });
                return;
            }
          }

          // check if user email verified
          if ( ! self.user.emailVerified ) {
            self.loginSuccess = false;
            self.stack.push({ class: 'foam.nanos.auth.ResendVerificationEmail' });
            return;
          }

          self.onUserUpdate();
        }
      })
      .catch(function (err) {
        self.requestLogin().then(function () {
          self.getCurrentUser();
        });
      });
    },

    function findCurrentBalance() {
      var self = this;
      this.client.currentBalanceDAO.find(this.user.id).then(function (a) {
        return self.currentBalance.copyFrom(a);
      }.bind(this));
    },
    
    function requestLogin() {
      var self = this;

      // don't go to log in screen if going to reset password screen
      if ( location.hash != null && location.hash === '#reset' )
        return new Promise(function(resolve, reject) {
          self.stack.push({ class: 'foam.nanos.auth.resetPassword.ResetView' });
          self.loginSuccess$.sub(resolve);
        });

      // don't go to log in screen if going to sign up password screen
      if ( location.hash != null && location.hash === '#sign-up' )
        return new Promise(function(resolve, reject) {
          self.stack.push({ class: 'net.nanopay.auth.ui.SignUpView' });
          self.loginSuccess$.sub(resolve);
        });

      return new Promise(function(resolve, reject) {
        self.stack.push({ class: 'net.nanopay.auth.ui.SignInView' });
        self.loginSuccess$.sub(resolve);
      });
    }
  ],

  listeners: [
    function onUserUpdate() {
      this.SUPER();
      this.findCurrentBalance();
    }
  ]
});
