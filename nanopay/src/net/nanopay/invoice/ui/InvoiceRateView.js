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
    'net.nanopay.fx.client.ClientFXService',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.fx.FXService',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.AbliiTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.ui.LoadingSpinner',
    'net.nanopay.ui.modal.TandCModal',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'appConfig',
    'auth',
    'ctrl',
    'currencyDAO',
    'fxService',
    'group',
    'invoice',
    'invoiceDAO',
    'notify',
    'transactionQuotePlanDAO',
    'user',
    'viewData',
    'wizard',
    'updateInvoiceDetails',
    'forceUpdate'
  ],

  exports: [
    'quote'
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
    ^label-value-row {
      margin-bottom: 5px;
    }
    ^large-margin-row {
      margin-bottom: 30px;
    }
    ^exchange-rate-text {
      color: #8e9090
    }
    ^ .fees {
      margin-top: 50px;
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
      `,
      postSet: function(_, nu) {
        this.viewData.quote = nu;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Currency',
      name: 'sourceCurrency',
      documentation: 'Stores the source currency for the exchange.'
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
        Stores the chosen bank account from the accountSelectionView.
        Pass a bankAccount as (chosenBankAccount) into view if setting isReadOnly.
        (This will populate values within the view)
      `
    },
    {
      name: 'formattedAmount',
      value: '...',
      documentation: 'formattedAmount contains the currency symbol.'
    },
    {
      name: 'isFx',
      expression: function(chosenBankAccount, invoice$destinationCurrency) {
        return chosenBankAccount != null &&
          ! (invoice$destinationCurrency == chosenBankAccount.denomination && chosenBankAccount.denomination === 'CAD');
      }
    },
    {
      name: 'showExchangeRateSection',
      expression: function(isPayable, isFx, loadingSpinner$isHidden) {
        return isPayable && loadingSpinner$isHidden && isFx;
      }
    },
    {
      name: 'isEmployee',
      expression: function(group) {
        return group.id.includes('.employee');
      }
    },
    {
      name: 'exchangeRateNotice',
      expression: function(isEmployee) {
        return isEmployee ? this.AFEX_RATE_NOTICE + this.NOTICE_WARNING : this.AFEX_RATE_NOTICE;
      }
    },
    {
      name: 'isSameCurrency',
      expression: function(invoice$destinationCurrency, chosenBankAccount) {
        return chosenBankAccount && invoice$destinationCurrency == chosenBankAccount.denomination;
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Payment details' },
    { name: 'REVIEW_TITLE', message: 'Review this payment' },
    { name: 'REVIEW_RECEIVABLE_TITLE', message: 'Review this receivable' },
    { name: 'ACCOUNT_WITHDRAW_LABEL', message: 'Withdraw from' },
    { name: 'ACCOUNT_DEPOSIT_LABEL', message: 'Deposit to' },
    { name: 'AMOUNT_DUE_LABEL', message: 'Amount Due' },
    { name: 'EXCHANGE_RATE_LABEL', message: 'Exchange Rate' },
    { name: 'CONVERTED_AMOUNT_LABEL', message: 'Converted Amount' },
    { name: 'TRANSACTION_FEE_LABEL', message: 'Transaction fee of ' },
    { name: 'TRANSACTION_FEE_LABEL_2', message: ' will be charged at the end of the monthly billing cycle.' },
    { name: 'AMOUNT_PAID_LABEL', message: 'Amount To Be Paid' },
    { name: 'AMOUNT_PAID_TO_LABEL', message: 'Amount Paid To You' },
    { name: 'CROSS_BORDER_PAYMENT_LABEL', message: 'Cross-border Payment' },
    { name: 'FETCHING_RATES', message: 'Fetching Rates...' },
    { name: 'LOADING', message: 'Getting quote...' },
    { name: 'TO', message: ' to ' },
    { name: 'ACCOUNT_FIND_ERROR', message: 'Error: Could not find account.' },
    { name: 'CURRENCY_FIND_ERROR', message: 'Error: Could not find currency.' },
    { name: 'RATE_FETCH_FAILURE', message: 'Error fetching rates: ' },
    { name: 'NOTICE_TITLE', message: '*NOTICE: EXCHANGE RATE SUBJECT TO CHANGE.' },
    { name: 'NOTICE_WARNING', message: 'The final exchange rate and resulting amount to be paid will be displayed to the approver.' },
    { name: 'AFEX_RATE_NOTICE', message: 'Rates provided are indicative until the payment is submitted. The rate displayed is held for 30 seconds at a time.' },
    { name: 'UNABLE_TO_PAY_TITLE', message: '*NOTICE: CANNOT PAY TO THIS CURRENCY.' },
    { name: 'CANNOT_PAY_TO_CURRENCY', message: 'Sorry, you cannot pay to this currency. You require enabling FX on our platform to complete the payment.' },
    { name: 'INR_RATE_LIMIT', message: 'This transaction exceeds your total daily limit for payments to India. For help, contact support at support@ablii.com' }

  ],

  methods: [
    function init() {
      this.loadingSpinner.hide();

      /** Fetch the rates because we need to make sure that the quote and
       * chosen account are available when rendering in read-only
       * mode in the approval flow.
       * And fetch the rate when we go back from 3rd to 2nd step
       * for send payment flow.
       */
      if ( this.wizard.isApproving ||
        ( this.invoice.account !== 0 && ! this.isReadOnly) ) {
        this.fetchRates();
      }

      if ( this.chosenBankAccount && ! this.sourceCurrency ) {
        this.setSourceCurrency();
      }
    },
    function initE() {
      let self = this;
      // Update the rates every time the selected account changes.
      if ( this.isPayable ) {
        this.invoice.account$.sub(this.fetchRates);
      } else {
        this.invoice.destinationAccount$.sub(this.fetchBankAccount);
      }

      // Format the amount & add the currency symbol
      if ( this.invoice.destinationCurrency !== undefined ) {
        this.currencyDAO.find(this.invoice.destinationCurrency)
          .then((currency) => {
          this.formattedAmount = currency.format(this.invoice.amount);
        });
      }

      var accountSelectionView = {
        class: 'foam.u2.view.RichChoiceView',
        selectionView: { class: 'net.nanopay.bank.ui.BankAccountSelectionView' },
        rowView: { class: 'net.nanopay.bank.ui.BankAccountCitationView' },
        sections: [
          {
            heading: 'Your bank accounts',
            dao: this.user.accounts.where(
              this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED)
            )
          }
        ]
      };

      var bankAccountSelection = this.isPayable
        ? this.Invoice.ACCOUNT
          .copyFrom({ view: accountSelectionView })
        : this.Invoice.DESTINATION_ACCOUNT
          .copyFrom({ view: accountSelectionView });

      this
        .start()
          .addClass(this.myClass())
          .start('h2')
            .add(! this.isReadOnly ? this.TITLE :
              this.isPayable ? this.REVIEW_TITLE :
              this.REVIEW_RECEIVABLE_TITLE)
          .end()
          .start().addClass(this.myClass('large-margin-row'))
            .start().addClass('inline').addClass('body-copy')
              .add(this.AMOUNT_DUE_LABEL)
            .end()
            .start().addClass('float-right').addClass('body-copy')
              .add(this.formattedAmount$)
            .end()
          .end()

          /** Show chosen bank account from previous step. **/
          .start()
            .addClass(this.myClass('large-margin-row'))
            .show(this.isReadOnly)
            .start().addClass('inline')
              .add( this.isPayable ?
                this.ACCOUNT_WITHDRAW_LABEL :
                this.ACCOUNT_DEPOSIT_LABEL )
            .end()
            .start().addClass('float-right')
              .add(this.chosenBankAccount$.map((bankAccount) => {
                if ( ! bankAccount ) return;
                var accountNumber = bankAccount.accountNumber;
                return bankAccount.name + ' ****'
                  + accountNumber.substr(accountNumber.length - 5)
                  + ' - '
                  + bankAccount.denomination;
              }))
            .end()
          .end()

          /** Account choice view with label, choice and advisory note. **/
          .start()
            .addClass('input-wrapper')
            .hide(this.isReadOnly)
            .start()
            .addClass('form-label')
              .add( this.isPayable ?
                this.ACCOUNT_WITHDRAW_LABEL :
                this.ACCOUNT_DEPOSIT_LABEL )
            .end()
            .startContext({ data: this })
              .start()
                .startContext({ data: this.invoice })
                  .add(bankAccountSelection)
                .endContext()
              .end()
            .endContext()
          .end()
          /** Loading spinner. **/
          .start().addClass('loading-spinner-container').hide(this.isReadOnly)
            .start().add(this.loadingSpinner).end()
            .start()
              .hide(this.loadingSpinner.isHidden$)
              .addClass('rate-msg-container')
              .add(this.slot(function( isSameCurrency ) {
                return isSameCurrency ? ' ' : this.FETCHING_RATES;
              }))
            .end()
          .end()

        /** Exchange rate details **/
        .add(this.slot(function(showExchangeRateSection, updateInvoiceDetails) {
          if ( this.forceUpdate ) {
            this.quote = updateInvoiceDetails;
            this.forceUpdate = false;
          }
          return ! showExchangeRateSection ? null :
            this.E()
              .start().show(this.slot(function(showExchangeRateSection, sourceCurrency, invoice$destinationCurrency ) {
                if ( sourceCurrency == null ) {
                  return false;
                }
                return showExchangeRateSection && (! (sourceCurrency.id === 'USD' && invoice$destinationCurrency === 'USD') );
              }))
                .start().addClass('exchange-amount-container')
                  .start()
                    .addClass(this.myClass('label-value-row'))
                    .addClass(this.myClass('exchange-rate-text'))
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
                        this.quote$.dot('destinationCurrency'),
                        this.quote$.dot('fxRate').map((rate) => {
                          if ( rate ) return this.TO + (1 / rate).toFixed(4);
                        }), ' ',
                        this.quote$.dot('sourceCurrency'),
                        this.exchangeRateNotice$.map((value) => value ? '*' : '')
                      )
                    .end()
                  .end()
                  .start()
                    .addClass(this.myClass('label-value-row'))
                    .start()
                      .addClass('inline')
                      .add(this.CONVERTED_AMOUNT_LABEL)
                    .end()
                    .start()
                      .addClass('float-right')
                      .add(this.slot(function(sourceCurrency, quote) {
                        if ( sourceCurrency && quote && quote.amount ) {
                          return sourceCurrency.format(quote.amount);
                        }
                        return '(-)';
                      }),
                        this.exchangeRateNotice$.map((value) => value ? '*' : '')
                      )
                    .end()
                  .end()
                .end()
              .end();
          }))

          /** Amount to be paid. **/
          .add(this.slot(function(quote, loadingSpinner$isHidden, sourceCurrency) {
            return ! quote || ! loadingSpinner$isHidden ? null :
              this.E()
                .start()
                  .addClass('label-value-row')
                  .addClass('amount-container')
                  .show(this.loadingSpinner.isHidden$)
                  .start().addClass('inline')
                    .add(this.isPayable ? this.AMOUNT_PAID_LABEL : this.isReadOnly ? this.AMOUNT_PAID_TO_LABEL : '')
                    .addClass('bold-label')
                  .end()
                  .start().addClass('float-right').addClass('bold-label')
                    .add(
                      this.quote$.dot('amount').map((amount) => {
                        if ( Number.isSafeInteger(amount) ) {
                          if ( ! sourceCurrency ) return;
                          return this.sourceCurrency.format(amount);
                        }
                      }),
                      this.isFx$.map((value) => value ? '*' : '')
                    )
                  .end()
                .end();
          }))
          .start().show(this.slot(function(quote) {
            if ( quote == null ) {
              return false;
            }
            return quote.getCost() == 0 ? false : true;
          }))
            .start()
              .addClass('inline')
              .addClass('fees')
              .add(this.TRANSACTION_FEE_LABEL)
              .add(
                this.slot( function(quote, sourceCurrency) {
                  if ( ! sourceCurrency || ! quote ) return;
                  return quote.getCost() ?
                    sourceCurrency.format(quote.getCost()) + this.TRANSACTION_FEE_LABEL_2:
                    sourceCurrency.format(0) + this.TRANSACTION_FEE_LABEL_2;
                })
              )
            .end()
          .end()
        .end()
        .start().show(this.slot(function(isFx, sourceCurrency, invoice$destinationCurrency) {
          if ( sourceCurrency == null ) {
            return false;
          }
          return isFx && (! (sourceCurrency.id === 'USD' && invoice$destinationCurrency === 'USD') );
        }))
          .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.exchangeRateNotice, title: this.NOTICE_TITLE })
        .end();
    },

    async function getDomesticQuote() {
      this.viewData.isDomestic = true;

      var transaction = this.AbliiTransaction.create({
        sourceAccount: this.invoice.account,
        destinationAccount: this.invoice.destinationAccount,
        sourceCurrency: this.invoice.sourceCurrency,
        destinationCurrency: this.invoice.destinationCurrency,
        payerId: this.invoice.payerId,
        payeeId: this.invoice.payeeId,
        amount: this.invoice.amount,
        destinationAmount: this.invoice.targetAmount,
      });
      var quote = await this.transactionQuotePlanDAO.put(
        this.TransactionQuote.create({
          requestTransaction: transaction
        })
      );
      return quote.plan;
    },
    async function getFXQuote() {
      var transaction = this.AbliiTransaction.create({
        sourceAccount: this.invoice.account,
        destinationAccount: this.invoice.destinationAccount,
        sourceCurrency: this.invoice.sourceCurrency,
        destinationCurrency: this.invoice.destinationCurrency,
        payerId: this.invoice.payerId,
        payeeId: this.invoice.payeeId,
        destinationAmount: this.invoice.amount
      });

      var quote = await this.transactionQuotePlanDAO.put(
        this.TransactionQuote.create({
          requestTransaction: transaction
        })
      );
      return quote.plan;
    }
  ],

  listeners: [
    async function fetchRates() {
      this.loadingSpinner.show();

      try {
        await this.fetchBankAccount();
      } catch (err) {
        this.notify(this.ACCOUNT_FIND_ERROR, 'error');
        console.error('@InvoiceRateView.js (Fetch Bank Account)' + (err ? err.message : ''));
      }

      try {
        this.viewData.isDomestic = ! this.isFx;
        var currencyCheck = `currency.read.${this.invoice.destinationCurrency}`;
        if ( ! await this.auth.check(null, currencyCheck) ) {
          this.notify(this.CANNOT_PAY_TO_CURRENCY, 'error');
          this.showExchangeRateSection = false;
          this.loadingSpinner.hide();
          return;
        }
        this.quote = this.isFx ? await this.getFXQuote() : await this.getDomesticQuote();
        this.viewData.quote = this.quote;
      } catch (error) {
        if ( error && error.message === 'Exceed INR Transaction limit' ) {
          this.notify(this.INR_RATE_LIMIT, 'error');
          this.loadingSpinner.hide();
          return;
        }
        this.notify(this.RATE_FETCH_FAILURE, 'error');
        console.error('@InvoiceRateView.js (Fetch Quote)' + (error ? error.message : ''));
      }

      this.loadingSpinner.hide();
    },

    async function fetchBankAccount() {
      // If the user selects the placeholder option in the account dropdown,
      // clear the data.
      var accountId = this.isPayable
        ? this.invoice.account
        : this.invoice.destinationAccount;
      if ( ! accountId && ! this.isReadOnly ) {
        this.viewData.bankAccount = null;
        // Clean the default account choice view
        if ( this.isPayable ) {
          this.quote = null;
          this.viewData.quote = null;
        }
        this.loadingSpinner.hide();
        return;
      }

      // Fetch chosen bank account.
      try {
        var accountId = this.isPayable
          ? this.invoice.account
          : this.invoice.destinationAccount;
        this.chosenBankAccount = await this.user.accounts.find(accountId);
        this.viewData.bankAccount = this.chosenBankAccount;
      } catch (error) {
        this.notify(this.ACCOUNT_FIND_ERROR, 'error');
        console.error('@InvoiceRateView.js (Fetch payer accounts)' + (error ? error.message : ''));
      }

      if ( ! this.isPayable ) {
        this.loadingSpinner.hide();
        return;
      }

      // Set Source Currency
      this.setSourceCurrency();

      // Update fields on Invoice, based on User choice
      this.invoice.sourceCurrency = this.chosenBankAccount.denomination;
    },

    async function setSourceCurrency() {
      try {
        // get currency for the selected account
        if ( this.chosenBankAccount.denomination ) {
          this.sourceCurrency = await this.currencyDAO
            .find(this.chosenBankAccount.denomination);
        }
      } catch (error) {
        this.notify(this.CURRENCY_FIND_ERROR, 'error');
        console.error('@InvoiceRateView.js (Set source currency)' + (error ? error.message : ''));
        this.loadingSpinner.hide();
        return;
      }
    },
  ],
});


