foam.CLASS({
  package: 'net.nanopay.invoice.model',
  name: 'Invoice',

  documentation: ' Model used by users to present' +
      ' and monitor transactional documents between' +
      ' one another and ensure the terms of their trading' +
      ' agreements are being met.',

  requires: [ 'net.nanopay.invoice.model.PaymentStatus' ],

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'addCommas'
  ],

  searchColumns: [
    'search', 'payerId', 'payeeId', 'status'
  ],

  tableColumns: [
    'invoiceNumber', 'purchaseOrder', 'payerId',
    'payeeId', 'issueDate', 'dueDate', 'amount', 'status'
  ],

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      name: 'search',
      documentation: `View and value used to filter invoices.`, // TODO
      transient: true,
      searchView: {
        class: 'foam.u2.search.TextSearchView',
        of: 'net.nanopay.invoice.model.Invoice',
        richSearch: true
      }
    },
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'invoiceNumber',
      documentation: `A number used by the user to identify the invoice.`,
      label: 'Invoice #',
      aliases: [
        'invoice',
        'i'
      ],
      visibility: foam.u2.Visibility.FINAL
    },
    {
      class: 'String',
      name: 'purchaseOrder',
      documentation: `A number used by the user to identify the purchase order
          associated with the invoice.`,
      label: 'PO #',
      aliases: [
        'purchase',
        'po',
        'p'
      ]
    },
    {
      class: 'Date',
      name: 'issueDate',
      documentation: `The date that the invoice was issued (created).`,
      label: 'Issue Date',
      required: true,
      factory: function() {
        return new Date();
      },
      javaFactory: 'return new Date();',
      aliases: [
        'issueDate',
        'issue',
        'issued'
      ],
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0, 10) : '');
      }
    },
    {
      class: 'Date',
      name: 'dueDate',
      documentation: `The date that the invoice must be paid by.`,
      label: 'Date Due',
      aliases: ['dueDate', 'due', 'd', 'issued'],
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0, 10) : '');
      }
    },
    {
      class: 'Date',
      name: 'paymentDate',
      documentation: `The date that the invoice was paid.`,
      label: 'Received',
      aliases: ['scheduled', 'paid'],
      tableCellFormatter: function(date) {
        if ( date ) {
          this.add(date.toISOString().substring(0, 10));
        }
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: `The date the invoice was created.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: `The id of the user who created the invoice.`,
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: `The date the invoice was last modified.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: `The id of the user who last modified the invoice.`,
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payee',
      documentation: `The party receiving the payment.`,
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payer',
      documentation: `The party making the payment.`,
      storageTransient: true
    },
    {
      class: 'Long',
      name: 'paymentId',
      documentation: `Transaction Id used to pay invoice.`,
    },
    {
      class: 'Boolean',
      name: 'draft',
      documentation: `Used to track whether an invoice is finalized or not.`,
      value: false
    },
    {
      class: 'String',
      name: 'invoiceFileUrl'
    },
    {
      class: 'String',
      name: 'note',
      documentation: `A written note that the user may add to the invoice.`,
      view: 'foam.u2.tag.TextArea'
    },
    {
      class: 'Currency',
      name: 'amount',
      documentation: `The amount of money the invoice is for. The amount of money that will be deposited into the destination account.  If fees or exchange applies the source amount may have to be adjusted.`,
      aliases: [
        'a',
        'targetAmount',
        'destinationAmount'
      ],
      precision: 2,
      required: true,
      tableCellFormatter: function(a, X) {
        var e = this;
        X.formatCurrencyAmount(a, e, X);
      }
    },
    { // How is this used? - display only?
      documentation: `Amount of funds to be withdrawn to pay for the invoice. This amount may be higher than the 'amount' (destination amount) if fees and/or exchange is involved.`,
      class: 'Currency',
      name: 'sourceAmount',
      documentation: 'The amount used to pay the' +
          ' invoice, prior to exchange rates & fees.',
      precision: 2,
      tableCellFormatter: function(a, X) {
        var e = this;
        X.formatCurrencyAmount(a, e, X);
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      documentation: `Account funds with be deposited into.`
    },
    {
      class: 'Currency',
      precision: 2,
      name: 'exchangeRate',
      documentation: 'Exchange rate captured on time of payment.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.invoice.model.PaymentStatus',
      name: 'paymentMethod',
      documentation: `The state of payment of the invoice.`
    },
    {
      class: 'Reference',
      name: 'destinationCurrency',
      of: 'net.nanopay.model.Currency',
      documentation: `Currency of the account the funds with be deposited into.`,
    },
    {
      class: 'Reference',
      name: 'sourceCurrency',
      of: 'net.nanopay.model.Currency',
      documentation: `Currency of the account the funds with be withdran from.`,
    },
    {
      name: 'iso20022',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      aliases: [
        'sourceAccount'
      ],
      documentation: `Invoiced account. The account funds will be withdrawn from.`
    },
    {
      class: 'String',
      name: 'status',
      documentation: `The state of the invoice regarding payment. This is a
          calculated property used to determine whether an invoice is due, void,
          pending, paid, scheduled, or overdue.`,
      transient: true,
      aliases: [
        's'
      ],
      expression: function(draft, paymentId, dueDate, paymentDate, paymentMethod) {
        if ( draft ) return 'Draft';
        if ( paymentMethod === this.PaymentStatus.VOID ) return 'Void';
        if ( paymentMethod === this.PaymentStatus.PENDING ) return 'Pending';
        if ( paymentMethod === this.PaymentStatus.CHEQUE ) return 'Paid';
        if ( paymentMethod === this.PaymentStatus.NANOPAY ) return 'Paid';
        if ( paymentDate > Date.now() && paymentId == 0 ) return ('Scheduled');
        if ( dueDate ) {
          if ( dueDate.getTime() < Date.now() ) return 'Overdue';
          if ( dueDate.getTime() < Date.now() + 24*3600*7*1000 ) return 'Due';
        }
        return 'Due';
      },
      javaGetter: `
        if ( getDraft() ) return "Draft";
        if ( getPaymentMethod() == PaymentStatus.VOID ) return "Void";
        if ( getPaymentMethod() == PaymentStatus.PENDING ) return "Pending";
        if ( getPaymentMethod() == PaymentStatus.CHEQUE ) return "Paid";
        if ( getPaymentMethod() == PaymentStatus.NANOPAY ) return "Paid";
        if ( getPaymentDate() != null ){
          if ( getPaymentDate().after(new Date()) && getPaymentId() == 0 ) return "Scheduled";
        }
        if ( getDueDate() != null ){
          if ( getDueDate().getTime() < System.currentTimeMillis() ) return "Overdue";
          if ( getDueDate().getTime() < System.currentTimeMillis() + 24*3600*7*1000 ) return "Due";
        }
        return "Due";
      `,
      searchView: {
        class: 'foam.u2.search.GroupBySearchView',
        width: 40,
        viewSpec: {
          class: 'foam.u2.view.ChoiceView',
          size: 8
        }
      },
      tableCellFormatter: function(state, obj, rel) {
        var label;
        label = state;
        if ( state === 'Scheduled' ) {
          label = label + ' ' + obj.paymentDate.toISOString().substring(0, 10);
        }

        this.start()
          .addClass('generic-status')
          .addClass('Invoice-Status-' + state)
          .add(label)
        .end();
      }
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'invoiceFile',
      documentation: 'Original invoice file',
      view: { class: 'net.nanopay.invoice.ui.InvoiceFileUploadView' }
    },
    {
      class: 'Boolean',
      name: 'scheduledEmailSent',
      documentation: `Used to track whether an email has been sent to the payer
          informing them that the payment they scheduled is near.`,
      value: false
    }
  ],

  methods: [
    {
      name: 'formatCurrencyAmount',
      code: function(a, e, X) {
        e.start().style({ 'padding-right': '20px' })
          .add(X.destinationCurrency + ' ' + X.addCommas((a/100).toFixed(2)))
        .end();
      },
      javaReturns: 'String',
      javaCode: `
        double amount = getAmount() / 100.0;
        return String.format(java.util.Locale.CANADA, "$%,.2f", amount);
      `
    }
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function(status) {
        return false;
        return status !== 'Paid' && this.lookup('net.nanopay.interac.ui.etransfer.TransferWizard', true);
      },
      code: function(X) {
        X.stack.push({
          class: 'net.nanopay.interac.ui.etransfer.TransferWizard',
          invoice: this
        });
      }
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.invoice.model.Invoice',
  forwardName: 'sales',
  inverseName: 'payeeId',
  documentation: '(REQUIRED) The receiver of the amount stated in the invoice.',
  required: true,
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Vendor',
    searchView: {
      class: 'foam.u2.search.GroupBySearchView',
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise(function(resolve, reject) {
          dao.find(key).then(function(user) {
            resolve(user ? user.label() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then(function(o) {
        this.add(o.label());
      }.bind(this));
    }
  }
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.invoice.model.Invoice',
  forwardName: 'expenses',
  inverseName: 'payerId',
  documentation: '(REQUIRED) Payer of the amount stated in the invoice.',
  required: true,
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Customer',
    searchView: {
      class: 'foam.u2.search.GroupBySearchView',
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise( function(resolve, reject) {
          dao.find(key).then( function(user) {
            resolve(user ? user.label() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.__context__[rel.targetDAOKey].find(value).then( function(o) {
        this.add(o.label());
      }.bind(this));
    }
  }
});
