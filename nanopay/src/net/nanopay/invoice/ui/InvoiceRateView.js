foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'InvoiceRateView',
  extends: 'foam.u2.View',

  documentation: `
    View related to paying or requesting money for an invoice. Display rate,
    account choice view on cross border payments.
    The view is capable of going into a read only state which is toggeable by the isReadOnly property.
    Pass transaction quote as property (quote) and bank account as (chosenBankAccount)
    to populate values on the views in read only. The view handles both payable and receivables
    to allow users to choose a bank account for paying invoices, using the isPayable view property.
  `,

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.fx.ascendantfx.AscendantFXTransaction',
    'net.nanopay.fx.ascendantfx.AscendantFXUser',
    'net.nanopay.fx.client.ClientFXService',
    'net.nanopay.ui.LoadingSpinner',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.ui.modal.TandCModal',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'accountDAO',
    'appConfig',
    'ascendantClientFXService',
    'ascendantFXUserDAO',
    'bareUserDAO',
    'ctrl',
    'currencyDAO',
    'invoice',
    'invoiceDAO',
    'transactionQuotePlanDAO',
    'localTransactionQuotePlanDAO',
    'user',
    'viewData'
  ],

  javaImports: [
    'net.nanopay.fx.ascendantfx.AscendantFXServiceProvider'
  ],

  exports: [
    'quote'
    // 'termsAndConditions'
  ],

  css: `
    ^ .inline {
      margin-right: 5px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin: 10px 0px;
    }
    ^ .exchange-amount-container{
      margin-top: 15px;
    }
    ^ .wizardBoldLabel {
      margin-bottom: 15px;
    }
    ^ .account-container {
      margin-top: 40px;
    }
    ^ .form-label {
      margin-bottom: 5px;
      font-weight: 500;
    }
    ^ .amount-container {
      margin-top: 20px;
    }
    ^ .foam-u2-view-RichChoiceView-selection-view {
      background: rgb(247, 247, 247, 1);
    }
    ^ .net-nanopay-ui-LoadingSpinner img{
      width: 35px;
    }
    ^ .net-nanopay-ui-LoadingSpinner {
      width: 65px;
      position: relative;
      margin: auto;
      margin-bottom: 10px;
    }
    ^ .rate-msg-container {
      width: 110px;
      margin: auto;
    }
    ^ .loading-spinner-container {
      margin: 40px 0px;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isPayable',
      documentation: 'Determines if invoice is a payable.',
      factory: function() {
        return this.invoice.payerId === this.user.id;
      }
    },
      // {
    //   class: 'Boolean',
    //   name: 'termsAndConditions',
    //   factory: function() {
    //     if ( this.viewData.termsAndConditions ) {
    //       return this.viewData.termsAndConditions;
    //     }
    //   },
    //   documentation: `
    //     Used to determine if user checked terms and conditions box.
    //     Enables proceeding to next step if true.
    //   `
    // },
    {
      class: 'Reference',
      of: 'net.nanopay.bank.BankAccount',
      name: 'accountChoice',
      documentation: 'Choice view for displaying and choosing user bank accounts.',
      view: function(_, X) {
        var m = foam.mlang.ExpressionsSingleton.create();
        var BankAccount = net.nanopay.bank.BankAccount;
        var BankAccountStatus = net.nanopay.bank.BankAccountStatus;
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.bank.ui.BankAccountSelectionView' },
          rowView: { class: 'net.nanopay.bank.ui.BankAccountCitationView' },
          sections: [
            {
              heading: 'Your bank accounts',
              dao: X.accountDAO.where(
                m.AND(
                  m.EQ(BankAccount.OWNER, X.user.id),
                  m.EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
                )
              )
            }
          ]
        };
      }
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    },
    {
      class: 'Boolean',
      name: 'isReadOnly',
      documentation: 'Used to make view read only.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'quote',
      documentation: `
        Stores the fetched transaction quote from transactionQuotePlanDAO.
        Pass a transaction quote as (quote) into view if setting isReadOnly.
        (This will populate values within the view)
      `
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Currency',
      name: 'sourceCurrency',
      documentation: 'Stores the source currency for the exchange.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Currency',
      name: 'destinationCurrency',
      factory: function() {
        return this.invoice.destinationCurrency;
      },
      documentation: 'Stores the destination currency for the exchange.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'chosenBankAccount',
      factory: function() {
        if ( this.viewData.bankAccount ) return this.viewData.bankAccount;
        return null;
      },
      documentation: `
        Stores the chosen bank account from accountChoice view.
        Pass a bankAccount as (chosenBankAccount) into view if setting isReadOnly.
        (This will populate values within the view)
      `
    },
    {
      class: 'Boolean',
      name: 'showRates'
    },
    {
      name: 'formattedAmount',
      value: '...',
      documentation: 'formattedAmount contains the currency symbol.'
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Payment details' },
    { name: 'REVIEW_TITLE', message: 'Review this payment' },
    { name: 'REVIEW_RECEIVABLE_TITLE', message: 'Review this receivable' },
    { name: 'ACCOUNT_WITHDRAW_LABEL', message: 'Withdraw from' },
    { name: 'ACCOUNT_DEPOSIT_LABEL', message: 'Deposit to' },
    { name: 'CURRENCY_RATE_ADVISORY', message: 'Currency conversion fees will be applied.' },
    { name: 'AMOUNT_DUE_LABEL', message: 'Amount Due' },
    { name: 'EXCHANGE_RATE_LABEL', message: 'Exchange Rate' },
    { name: 'CONVERTED_AMOUNT_LABEL', message: 'Converted Amount' },
    { name: 'TRANSACTION_FEE_LABEL', message: 'Transaction Fees' },
    { name: 'AMOUNT_PAID_LABEL', message: 'Amount To Be Paid' },
    { name: 'AMOUNT_PAID_TO_LABEL', message: 'Amount Paid To You' },
    { name: 'CROSS_BORDER_PAYMENT_LABEL', message: 'Cross-border Payment' },
    { name: 'FETCHING_RATES', message: 'Fetching Rates...' },
    // { name: 'TERMS_AGREEMENT_BEFORE_LINK', message: 'I agree to Ablii’s' },
    // { name: 'TERMS_AGREEMENT_LINK', message: 'Terms and Conditions' },
    // { name: 'TERMS_AGREEMENT_AFTER_LINK', message: 'for cross-border payments' },
    { name: 'TO', message: ' to ' }
  ],

  methods: [
    function init() {
      this.loadingSpinner.hide();
    },
    function initE() {
      this.accountChoice$.sub(this.fetchRates);
      this.accountChoice = this.viewData.bankAccount ?
          this.viewData.bankAccount.id : this.accountChoice;

      // Format the amount & add the currency symbol
      if ( this.invoice.destinationCurrency !== undefined ) {
        this.invoice.destinationCurrency$find.then((currency) => {
          this.formattedAmount = currency.format(this.invoice.amount);
        });
      }

      this
        .start()
          .addClass(this.myClass())
          .start('h2')
            .add(! this.isReadOnly ? this.TITLE : this.isPayable ? this.REVIEW_TITLE : this.REVIEW_RECEIVABLE_TITLE)
          .end()

          .start().addClass('label-value-row')
            .start().addClass('inline').addClass('body-copy')
              .add(this.AMOUNT_DUE_LABEL)
            .end()
            .start().addClass('float-right').addClass('body-copy')
              .add(this.formattedAmount$)
              .add(` ${this.invoice.destinationCurrency}`)
            .end()
          .end()

          /** Account choice view with label, choice and advisory note. **/
          .start()
            .addClass('input-wrapper')
            .hide(this.isReadOnly)
            .start()
              .add( this.isPayable ? this.ACCOUNT_WITHDRAW_LABEL : this.ACCOUNT_DEPOSIT_LABEL ).addClass('form-label')
            .end()
            .startContext({ data: this })
              .start()
                .add(this.ACCOUNT_CHOICE)
              .end()
            .endContext()
            .start()
              .add( this.isPayable ? this.CURRENCY_RATE_ADVISORY : null )
            .end()
          .end()
          /** Show chosen bank account from previous step. **/
          .start().addClass('label-value-row').show(this.isReadOnly)
            .start().addClass('inline')
              .add( this.isPayable ? this.ACCOUNT_WITHDRAW_LABEL : this.ACCOUNT_DEPOSIT_LABEL )
            .end()
            .start().addClass('float-right')
              .add(this.chosenBankAccount$.map((bankAccount) => {
                if ( ! bankAccount ) return;
                var accountNumber = bankAccount.accountNumber;
                return bankAccount.name + ' ****' + accountNumber.substr(accountNumber.length - 5) + ' - ' + bankAccount.denomination;
              }))
            .end()
          .end()
          /** Exchange rate details **/
          .start().addClass('loading-spinner-container')
            .start().add(this.loadingSpinner).end()
            .start()
              .hide(this.loadingSpinner.isHidden$)
              .addClass('rate-msg-container')
              .add(this.FETCHING_RATES)
            .end()
          .end()

          .start()
            .show(this.isPayable$)
            .show(this.loadingSpinner.isHidden$)
            .show(this.showRates$)
            .addClass('exchange-amount-container')
            .start()
              .addClass('label-value-row')
              .start()
                .addClass('inline')
                .add(this.EXCHANGE_RATE_LABEL)
              .end()
              .start()
                .addClass('float-right')
                .add(
                  this.quote$.dot('fxRate').map((rate) => {
                    if ( rate ) return 1;
                  }), ' ',
                  this.quote$.dot('sourceCurrency'),
                  this.quote$.dot('fxRate').map((rate) => {
                    if ( rate ) return this.TO + rate.toFixed(4);
                  }), ' ',
                  this.quote$.dot('destinationCurrency')
                )
              .end()
            .end()
            .start()
              .addClass('label-value-row')
              .start()
                .addClass('inline')
                .add(this.CONVERTED_AMOUNT_LABEL)
              .end()
              .start()
                .addClass('float-right')
                .add(
                  this.quote$.dot('amount').map((fxAmount) => {
                    if ( fxAmount ) return this.sourceCurrency.format(fxAmount);
                  }), ' ',
                  this.quote$.dot('sourceCurrency')
                )
              .end()
            .end()
            .start().show(this.chosenBankAccount$)
              .addClass('label-value-row')
              .start()
                .addClass('inline')
                .add(this.TRANSACTION_FEE_LABEL)
              .end()
              .start()
                .addClass('float-right')
                .add(
                  this.quote$.dot('fxFees').dot('totalFees').map((fee) => {
                    return fee ? this.sourceCurrency.format(fee) : '';
                  }), ' ',
                  this.quote$.dot('fxFees').dot('totalFeesCurrency')
                )
              .end()
            .end()
          .end()
          .start().addClass('label-value-row').addClass('amount-container').show(this.showRates$)
            .start().addClass('inline')
              .add(this.isPayable ? this.AMOUNT_PAID_LABEL : this.isReadOnly ? this.AMOUNT_PAID_TO_LABEL : '').addClass('bold-label')
            .end()
            .start().addClass('float-right').addClass('bold-label')
              .add(
                this.quote$.dot('amount').map((amount) => {
                  if ( Number.isSafeInteger(amount) ) return this.sourceCurrency.format(amount);
                }), ' ',
                this.quote$.dot('sourceCurrency')
              )
            .end()
          .end()
          // /** Terms and condition check  **/
          // .start().addClass('terms-container').show(this.isPayable && ! this.isReadOnly)
          //   .start().addClass('wizardBoldLabel')
          //     .add(this.CROSS_BORDER_PAYMENT_LABEL)
          //   .end()
          //   .start()
          //   .tag({ class: 'foam.u2.CheckBox', data$: this.termsAndConditions$ })
          //   .on('click', (event) => {
          //     this.viewData.termsAndConditions = event.target.checked;
          //   })
          //   .start().addClass('inline').add(this.TERMS_AGREEMENT_BEFORE_LINK).end()
          //   .start().addClass('link').addClass('inline')
          //     .add(this.TERMS_AGREEMENT_LINK)
          //     .on('click', () => {
          //       this.add(this.Popup.create().tag({
          //         class: this.appConfig.termsAndCondLink,
          //         exportData$: this.appConfig.version$
          //       }));
          //     })
          //   .end()
          //   .start().addClass('inline').add(this.TERMS_AGREEMENT_AFTER_LINK).end()
          // .end()
        .end();
    }
  ],

  listeners: [
    async function fetchRates() {
      this.loadingSpinner.show();
      // set quote as empty when select the placeholder
      if ( ! this.accountChoice ) {
        this.viewData.bankAccount = null;
        // Clean the default account choice view
        if ( this.isPayable ) {
          this.quote = null;
          this.viewData.quote = null;
        }
        return;
      }

      // Fetch chosen bank account.
      try {
        this.chosenBankAccount = await this.accountDAO.find(this.accountChoice);
        this.viewData.bankAccount = this.chosenBankAccount;
      } catch (error) {
        ctrl.add(this.NotificationMessage.create({
          message: `Internal Error: In Bank Choice, please try again in a few minutes. ${error.message}`, type: 'error'
        }));
      }

      // TODO: MAY need quote for receivables
      if ( ! this.isPayable ) {
        this.showRates = true;
        this.loadingSpinner.hide();
        this.showRates = false;
        return;
      }

      // Set currency variables
      try {
        // Check denominations for chosen account and currency payee will accept
        if ( this.chosenBankAccount.denomination && this.invoice.destinationCurrency ) {
          this.sourceCurrency = await this.currencyDAO.find(this.chosenBankAccount.denomination);
          this.destinationCurrency = await this.currencyDAO.find(this.invoice.destinationCurrency);
        }
      } catch (error) {
        ctrl.add(this.NotificationMessage.create({
          message: `Internal Error: In finding Currencies. ${error.message}`, type: 'error'
        }));
        this.loadingSpinner.hide();
        return;
      }

      // Update fields on Invoice, based on User choice
      this.invoice.account = this.chosenBankAccount.id;
      this.invoice.sourceCurrency = this.chosenBankAccount.denomination;

      try {
        this.invoice = await this.invoiceDAO.put(this.invoice);
      } catch (error) {
        ctrl.add(this.NotificationMessage.create({ message: `Internal Error: invoice update failed ${error.message}`, type: 'error' }));
        this.loadingSpinner.hide();
        return;
      }

      if ( foam.util.equals(this.invoice.sourceCurrency, 'CAD') && foam.util.equals(this.invoice.destinationCurrency, 'CAD') ) {
        this.viewData.isDomestic = true;
      } else {
        // Using the this.ascendantClientFXService.
        this.viewData.isDomestic = false;

        // Check to see if user is registered with ascendant.
        var ascendantUser = await this.ascendantFXUserDAO.where(this.EQ(this.AscendantFXUser.USER, this.user.id)).select();
        ascendantUser = ascendantUser.array[0];

        // TODO: this should not be manual
          // Create ascendant user if none exists. Permit fetching ascendant rates.
        if ( ! ascendantUser ) {
          ascendantUser = this.AscendantFXUser.create({
            user: this.user.id,
            orgId: '5904960', // Manual for now. Will be automated on the ascendantFXUserDAO service in the future. Required for KYC on Ascendant.
            name: this.user.organization ? this.user.organization : this.user.label()
          });
          ascendantUser = await this.ascendantFXUserDAO.put(ascendantUser);
        }

        try {
          var fxQuote = await this.ascendantClientFXService.getFXRate(
            this.invoice.sourceCurrency,
            this.invoice.destinationCurrency,
            0, this.invoice.amount, 'Buy',
            null, this.user.id, null );
        } catch (error) {
          ctrl.add(this.NotificationMessage.create({ message: `Error fetching rates ${error.message}`, type: 'error' }));
          this.loadingSpinner.hide();
          return;
        }

        if ( fxQuote.id != 0 ) {
          var fees = this.FeesFields.create({
            totalFees: fxQuote.fee,
            totalFeesCurrency: fxQuote.feeCurrency
          });
          this.viewData.fxTransaction = this.AscendantFXTransaction.create({
            payerId: this.user.id,
            payeeId: this.invoice.payeeId,
            sourceAccount: this.invoice.account,
            destinationAccount: this.invoice.destinationAccount,
            amount: fxQuote.sourceAmount,
            destinationAmount: fxQuote.targetAmount,
            sourceCurrency: this.invoice.sourceCurrency,
            destinationCurrency: this.invoice.destinationCurrency,
            invoiceId: this.invoice.id,
            fxExpiry: fxQuote.expiryTime,
            fxQuoteId: fxQuote.id,
            fxRate: fxQuote.rate,
            fxFees: fees,
            invoiceId: this.invoice.id,
            isQuoted: true
          });
          this.showRates = true;
          this.loadingSpinner.hide();

          this.viewData.quote = this.quote = this.viewData.fxTransaction;
        }
      }
    }
  ]
});
