/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.invoice.model',
  name: 'Invoice',

  documentation: `The base model for presenting and monitoring transactional
    documents between Users, and to Users, and ensuring the terms of their
    trading agreements are met.
  `,

  requires: [
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.ServiceProviderAware',
    'foam.nanos.crunch.lite.Capable',
  ],

  searchColumns: [
    'invoiceNumber',
    'payerId',
    'payeeId',
    'issueDate',
    'payeeReconciled',
    'payerReconciled',
    'amount',
    'status'
  ],

  tableColumns: [
    'id',
    'invoiceNumber',
    'payerId.businessName',
    'payeeId.businessName',
    'issueDate',
    'amount',
    'status'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.util.SafetyUtil',
    'java.util.Date',
    'java.util.UUID',
    'net.nanopay.admin.model.AccountStatus',
    'foam.core.Currency',
    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.InvoiceLineItem'
  ],

  imports: [
    'currencyDAO',
    'user'
  ],

  properties: [
    ...(foam.nanos.crunch.lite.CapableObjectData
      .getOwnAxiomsByClass(foam.core.Property)
      .map(p => p.clone())),
    {
      name: 'search',
      documentation: `The view and value used to filter invoices.`,
      transient: true,
      searchView: {
        class: 'foam.u2.search.TextSearchView',
        of: 'net.nanopay.invoice.model.Invoice',
        richSearch: true
      }
    },
    {
      class: 'Long',
      name: 'id',
      documentation: 'The ID for the Invoice.',
      tableWidth: 60,
      sheetsOutput: true
    },
    {
      class: 'String',
      name: 'invoiceNumber',
      documentation: `The identifying number stated on the invoice.`,
      label: 'Invoice #',
      aliases: [
        'invoice',
        'i'
      ],
      updateVisibility: 'RO',
      tableWidth: 110
    },
    {
      class: 'String',
      name: 'purchaseOrder',
      documentation: `The identifying number from the purchase order as stated
        on the invoice.
      `,
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
      label: 'Date Issued',
      required: true,
      view: { class: 'foam.u2.DateView' },
      factory: function() {
        if ( this.draft ) {
          return null;
        }
        return new Date();
      },
      javaFactory: `
        if ( draft_ ){
          return null;
        }
        return new Date();
      `,
      javaSetter: `
        if ( isFrozen() ) throw new UnsupportedOperationException("Object is frozen.");
        issueDate_ = val;
        if ( issueDate_ != null ) {
          issueDateIsSet_ = true;
        }
      `,
      tableCellFormatter: function(val) {
        this.add(val.toISOString().substring(0, 10));
      },
      aliases: [
        'issueDate',
        'issue',
        'issued'
      ]
    },
    {
      class: 'Date',
      name: 'dueDate',
      documentation: `The date by which the invoice must be paid.`,
      label: 'Date Due',
      tableCellFormatter: function(val) {
        this.add(val.toISOString().substring(0, 10));
      },
      aliases: ['dueDate', 'due', 'd', 'issued'],
      tableWidth: 95
    },
    {
      class: 'DateTime',
      name: 'paymentDate',
      documentation: `The date and time of when the invoice payment was fully completed.`,
      label: 'Received',
      aliases: ['scheduled', 'paid']
    },
    {
      class: 'Date',
      name: 'processingDate',
      documentation: `The date by which the invoice payment begun.`,
      tableCellFormatter: function(val) {
        this.add(val ? val.toISOString().substring(0, 10) : null);
      }
    },
    {
      class: 'Date',
      name: 'approvalDate',
      documentation: `The date by which the invoice approval occured.`,
      tableCellFormatter: function(val) {
        this.add(val ? val.toISOString().substring(0, 10) : null);
      }
    },
    {
      class: 'Date',
      name: 'paymentSentDate',
      documentation: `The date by which the invoice payment was sent.`,
      tableCellFormatter: function(val) {
        this.add(vale ? val.toISOString().substring(0, 10) : null);
      }
    },
    {
      class: 'Date',
      name: 'paymentReceivedDate',
      documentation: `The date by which the invoice payment was received.`,
      tableCellFormatter: function(val) {
        this.add(val ? val.toISOString().substring(0, 10) : null);
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: `The date and time of when the invoice was created.`,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: `The ID of the User who created the Invoice.`,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          sections: [
            {
              heading: 'Users',
              dao: X.userDAO.orderBy(foam.nanos.auth.User.LEGAL_NAME)
            }
          ]
        };
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: `The ID of the Agent who created the Invoice.`,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          sections: [
            {
              heading: 'Users',
              dao: X.userDAO.orderBy(foam.nanos.auth.User.LEGAL_NAME)
            }
          ]
        };
      }
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: `The date and time that the Invoice was last modified.`,
      tableWidth: 140
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: `The ID of the individual person, or real user,
        who last modified the Invoice.`,
    },
    {
      class: 'DateTime',
      name: 'lastDateUpdated',
      documentation: 'Last time a XeroInvoice or QuickbooksInvoice was updated.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payee',
      documentation: `Returns the name of the party receiving the payment from the
        Public User Info model.`,
      hidden: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payer',
      documentation: `Returns the name of the party making the payment from the
        Public User Info model.`,
      hidden: true
    },
    {
      class: 'String',
      name: 'paymentId',
      documentation: `The transaction ID used to pay the invoice.`,
    },
    {
      class: 'Boolean',
      name: 'draft',
      documentation: `Determines whether the Invoice is finalized.`,
      value: false
    },
    {
      class: 'String',
      name: 'invoiceFileUrl',
      documentation: 'A URL link to the online location of the invoice.'
      // invoiceFileUrl is not used. All references are commented out.
    },
    {
      class: 'String',
      name: 'note',
      documentation: `A written note that the user may add to the invoice.`,
      view: 'foam.u2.tag.TextArea'
    },
    {
      class: 'UnitValue',
      name: 'chequeAmount',
      documentation: `The amount paid for an invoice using an external transaction system.`
    },
    {
      class: 'String',
      name: 'chequeCurrency',
      documentation: `The currency of a transaction using by external transaction system.`,
      value: 'CAD'
    },
    {
      class: 'UnitValue',
      name: 'amount',
      unitPropName: 'destinationCurrency',
      documentation: `
        The amount transferred or paid as per the invoice. The amount of money that will be
        deposited into the destination account. If fees or exchange apply, the source amount
        may have to be adjusted.
      `,
      aliases: [
        'a',
        'targetAmount',
        'destinationAmount'
      ],
      required: true,
      tableWidth: 120,
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.currencyDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
      javaToCSV: `
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        String dstCurrency = ((Invoice)obj).getDestinationCurrency();
        Currency currency = (Currency) currencyDAO.find(dstCurrency);

        // Outputting two columns: "amount", "destination Currency"
        outputter.outputValue(currency.format(get_(obj)));
        outputter.outputValue(dstCurrency);
      `,
      javaToCSVLabel: `
        // Outputting two columns: "amount", "destination Currency"
        outputter.outputValue(getName());
        outputter.outputValue("Destination Currency");
      `
    },
    { // How is this used? - display only?,
      class: 'UnitValue',
      name: 'sourceAmount',
      unitPropName: 'sourceCurrency',
      documentation: `The amount paid to the invoice, prior to exchange rates & fees.
      `
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      documentation: `The bank account into which funds are to be deposited.`
    },
    {
      class: 'UnitValue',
      name: 'exchangeRate',
      documentation: 'The exchange rate captured at the time of payment.'
    },
    {
      // TODO Ensure client can't change this manually
      class: 'Enum',
      of: 'net.nanopay.invoice.model.PaymentStatus',
      name: 'paymentMethod',
      documentation: `Tracks the payment instrument or method used to pay the invoice.`
    },
    {
      class: 'String',
      name: 'destinationCurrency',
      value: 'CAD',
      documentation: `The currency of the bank account into which funds are to
        be deposited.
      `
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      value: 'CAD',
      documentation: `The currency of the bank account from which funds are to be
        withdrawn.`,
    },
    {
      name: 'iso20022',
    },
    {
      class: 'Boolean',
      name: 'external',
      documentation: 'Determines whether the invoice was created for an external user.'
    },
    {
      class: 'Boolean',
      name: 'autoPay',
      documentation: 'Determines whether the invoice can be paid automatically.'
      // TODO
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approvedBy',
      documentation: 'the ID of the user that approved this invoice within the business.',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          sections: [
            {
              heading: 'Users',
              dao: X.userDAO.orderBy(foam.nanos.auth.User.LEGAL_NAME)
            }
          ]
        };
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      aliases: [
        'sourceAccount'
      ],
      documentation: `As the invoiced account, this is the bank account from which
        funds will be withdrawn to pay an invoice.
      `
    },
    {
      class: 'Enum',
      of: 'net.nanopay.invoice.model.InvoiceStatus',
      name: 'status',
      documentation: `A list of the types of status for an invoice regarding payment. This
        is a calculated property used to determine whether an invoice is unpaid,
        void, pending, paid, scheduled, or overdue.
      `,
      aliases: [
        's'
      ],
      expression: function(draft, paymentId, dueDate, paymentDate, paymentMethod) {
        if ( draft ) return this.InvoiceStatus.DRAFT;
        if ( paymentMethod === this.PaymentStatus.VOID ) return this.InvoiceStatus.VOID;
        if ( paymentMethod === this.PaymentStatus.PROCESSING ) return this.InvoiceStatus.PROCESSING;
        if ( paymentMethod === this.PaymentStatus.CHEQUE ) return this.InvoiceStatus.PAID;
        if ( paymentMethod === this.PaymentStatus.NANOPAY ) return this.InvoiceStatus.PAID;
        if ( paymentMethod === this.PaymentStatus.TRANSIT_PAYMENT ) return this.InvoiceStatus.PROCESSING;
        if ( paymentMethod === this.PaymentStatus.DEPOSIT_PAYMENT ) return this.InvoiceStatus.PENDING_ACCEPTANCE;
        if ( paymentMethod === this.PaymentStatus.DEPOSIT_MONEY ) return this.InvoiceStatus.DEPOSITING_MONEY;
        if ( paymentMethod === this.PaymentStatus.PENDING_APPROVAL ) {
          if (this.user.id === this.payeeId ) return this.InvoiceStatus.UNPAID;
          else return this.InvoiceStatus.PENDING_APPROVAL;
        }
        if ( paymentMethod === this.PaymentStatus.REJECTED ) return this.InvoiceStatus.REJECTED;
        if ( paymentDate > Date.now() && paymentId == 0 ) return (this.InvoiceStatus.SCHEDULED);
        if ( dueDate ) {
          if ( dueDate.getTime() < Date.now() ) return this.InvoiceStatus.OVERDUE;
          if ( dueDate.getTime() < Date.now() + 24*3600*7*1000 ) return this.InvoiceStatus.UNPAID;
        }
        return this.InvoiceStatus.UNPAID;
      },
      javaGetter: `
        if ( getDraft() ) return InvoiceStatus.DRAFT;

        switch ( getPaymentMethod() ) {
          case PROCESSING:
          case TRANSIT_PAYMENT:
            return InvoiceStatus.PROCESSING;
          case CHEQUE:
          case NANOPAY:
            return InvoiceStatus.PAID;
          case VOID:
            return InvoiceStatus.VOID;
          case DEPOSIT_PAYMENT:
            return InvoiceStatus.PENDING_ACCEPTANCE;
          case DEPOSIT_MONEY:
            return InvoiceStatus.DEPOSITING_MONEY;
          case PENDING_APPROVAL:
            return InvoiceStatus.PENDING_APPROVAL;
          case REJECTED:
            return InvoiceStatus.REJECTED;
          case QUOTED:
            return InvoiceStatus.QUOTED;
          case SUBMIT:
            return InvoiceStatus.SUBMIT;
        }

        if ( getPaymentDate() != null ){
          if ( getPaymentDate().after(new Date()) && SafetyUtil.isEmpty(getPaymentId()) ) return InvoiceStatus.SCHEDULED;
        }
        if ( getDueDate() != null ){
          if ( getDueDate().getTime() < System.currentTimeMillis() ) return InvoiceStatus.OVERDUE;
          if ( getDueDate().getTime() < System.currentTimeMillis() + 24*3600*7*1000 ) return InvoiceStatus.UNPAID;
        }
        return InvoiceStatus.UNPAID;
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
        var name = state.name;
        var label = state.label;
        if ( state === net.nanopay.invoice.model.InvoiceStatus.SCHEDULED ) {
          label = label + ' ' + obj.paymentDate.toISOString().substring(0, 10);
        }

        this.start()
          .addClass('invoice-status-container')
          .start().addClass('generic-status-circle').addClass(name.replace(/\W+/g, '-')).end()
          .start().addClass('Invoice-Status').addClass(name.replace(/\W+/g, '-'))
            .add(label)
          .end()
        .end();
      },
      tableWidth: 130
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'invoiceFile',
      label: 'Attachment',
      tableWidth: 100,
      documentation: 'A stored copy of the original invoice document.',
      view: { class: 'net.nanopay.invoice.ui.InvoiceFileUploadView' },
      tableCellFormatter: function(files) {
        if ( ! (Array.isArray(files) && files.length > 0) ) return;
        var actions = files.map((file) => {
          return foam.core.Action.create({
            label: file.filename,
            code: function() {
              window.open(file.address, '_blank');
            }
          });
        });
        this.tag({
          class: 'foam.u2.view.OverlayActionListView',
          data: actions,
          obj: this,
          activeImageURL: '/images/attachment-purple.svg',
          restingImageURL: '/images/attachment.svg',
          hoverImageURL: '/images/attachment.svg',
          disabledImageURL: '/images/attachment.svg',
        });
      },
      javaToCSV: `
        StringBuilder sb = new StringBuilder();
        foam.nanos.fs.File[] filesList = get_(obj);
        foam.nanos.fs.File file;

        sb.append("[");
        for(int i = 0; i < filesList.length; i++ ) {
          if ( i != 0 ) sb.append(",");
          file = filesList[i];
          sb.append(file.isPropertySet("address") ? file.getAddress() : file.getFilename());
        }
        sb.append("]");
        outputter.outputValue(sb.toString());
      `
    },
    {
      class: 'Boolean',
      name: 'scheduledEmailSent',
      documentation: `Determines whether an email has been sent to the Payer
        informing them that the payment they scheduled is due.`,
      value: false
    },
    {
      class: 'String',
      name: 'referenceId',
      documentation: `The unique identifier for sent and received form email.`,
      factory: function() {
        return foam.uuid.randomGUID();
      },
      javaFactory: `
        return UUID.randomUUID().toString();
      `
    },
    {
      class: 'Boolean',
      name: 'removed',
      documentation: 'Determines whether an invoice has been removed.'
    },
    {
      class: 'Reference',
      targetDAOKey: 'contactDAO',
      of: 'net.nanopay.contacts.Contact',
      name: 'contactId',
      value: 0,
      documentation: `The unique identifier for the Contact, representing people who,
        although they are not registered on the platform, can still receive invoices from
        platform users.`,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: {
            class: 'net.nanopay.auth.ui.UserSelectionView',
            emptySelectionLabel: X.data.SELECT_CONTACT
          },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          sections: [
            {
              dao: X.user.contacts.orderBy(foam.nanos.auth.User.ORGANIZATION),
              searchBy: [
                net.nanopay.contacts.Contact.ORGANIZATION,
                net.nanopay.contacts.Contact.OPERATING_BUSINESS_NAME
              ]
            }
          ]
        };
      }
    },
    {
      class: 'Boolean',
      name: 'isSyncedWithAccounting',
      factory: function() {
        return net.nanopay.accounting.xero.model.XeroInvoice.isInstance(this) ||
        net.nanopay.accounting.quickbooks.model.QuickbooksInvoice.isInstance(this);
      },
      documentation: 'Checks if invoice has been synced with accounting software.',
      visibility: 'RO'
    },
    {
      name: 'lineItems',
      class: 'FObjectArray',
      of: 'net.nanopay.invoice.InvoiceLineItem',
      javaValue: 'new InvoiceLineItem[] {}',
      visibility: 'RO',
      view: {
        class: 'foam.u2.view.FObjectArrayView',
        valueView: 'foam.u2.CitationView'
      }
    },
    {
      class: 'Boolean',
      name: 'payeeReconciled',
      documentation: `Determines whether invoice has been reconciled by payee.
          Verifies that the receive amount is correct.`
    },
    {
      class: 'Boolean',
      name: 'payerReconciled',
      documentation: `Determines whether invoice has been reconciled by payer.
          Verifies that the sent amount is correct.`
    },
    {
      class: 'FObjectArray',
      name: 'transactionHistory',
      of: 'net.nanopay.tx.model.Transaction',
      view: { class: 'foam.u2.view.DAOtoFObjectArrayView' },
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'processPaymentOnCreate',
      documentation: `When set to true, on invoice submit a transaction will be planned and submitted.
          If the transaction require fx, current rates will be used and there will NOT be a chance to review these rates.
          Send required lineitems using the 'transactionLineItems' property if required.
        `,
      storageTransient: true,
      value: false
    },
    {
      class: 'FObjectArray',
      name: 'transactionLineItems',
      of: 'net.nanopay.tx.TransactionLineItem',
      hidden: 'true',
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.TransactionQuote',
      name: 'quote',
      hidden: true,
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'requestTransaction',
      hidden: true,
      storageTransient: true,
      networkTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'plan',
      hidden: true,
      storageTransient: true,
    },
    {
      class: 'String',
      name: 'totalSourceAmount',
      section: 'invoiceInformation'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      writePermissionRequired: true,
      documentation: `
        Need to override getter to return "" because its trying to
        return null (probably as a result of moving order of files
        in nanos), which breaks tests
      `,
      javaGetter: `
        if ( ! spidIsSet_ ) {
          return "";
        }
        return spid_;
      `
    }
  ],

  messages: [
    { name: 'SELECT_CONTACT', message: 'Select contact' },
    // used in MarkAsVoidModal and InvoiceVoidEmailRule
    { name: 'ON_VOID_NOTE', message: 'On Void Note: ' }
  ],

  methods: [
    ...(foam.nanos.crunch.lite.CapableObjectData
      .getOwnAxiomsByClass(foam.core.Method)
      .map(m => m.clone())),
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        DAO bareUserDAO = (DAO) x.get("bareUserDAO");
        DAO currencyDAO = (DAO) x.get("currencyDAO");

        if ( SafetyUtil.isEmpty(this.getDestinationCurrency()) ) {
          throw new IllegalStateException("Destination currency of the invoice cannot be empty.");
        } else {
          Currency currency = (Currency) currencyDAO.find(this.getDestinationCurrency());
          if ( currency == null ) {
            throw new IllegalStateException("Destination currency is not valid.");
          }
        }
        if ( this.getAmount() < 0 ) {
          throw new IllegalStateException("Amount must be a number and no less than zero.");
        }

        boolean isInvoiceToContact = this.getContactId() != 0;
        boolean isPayeeIdGiven = this.getPayeeId() != 0;
        boolean isPayerIdGiven = this.getPayerId() != 0;

        if( ! isInvoiceToContact && ! isPayeeIdGiven && ! isPayerIdGiven ) {
            throw new IllegalStateException("ContactId/PayeeId/PayerId not provided.");
        }

        Contact contact = null;
        if ( isInvoiceToContact ) {
          contact = (Contact) bareUserDAO.find(this.getContactId());
          if ( contact == null ) {
            throw new IllegalStateException("No contact with the provided contactId exists.");
          }
          if ( ! isPayeeIdGiven && ! isPayerIdGiven ) {
            throw new IllegalStateException("PayeeId or PayerId not provided with the contact.");
          }
        }

        if ( ! isPayeeIdGiven && ! isInvoiceToContact ) {
          throw new IllegalStateException("Payee id must be an integer greater than zero.");
        } else {
          User payee = (User) bareUserDAO.find(
            isPayeeIdGiven ? this.getPayeeId() : contact.getBusinessId() != 0 ? contact.getBusinessId() : contact.getId());
          if ( payee == null && ( contact == null || contact.getBusinessId() != 0 ) ) {
            throw new IllegalStateException("No user, contact, or business with the provided payeeId exists.");
          }
          // TODO: Move user checking to user validation service
          if ( payee != null && AccountStatus.DISABLED == payee.getStatus() ) {
            throw new IllegalStateException("Payee user is disabled.");
          }
        }

        if ( ! isPayerIdGiven && ! isInvoiceToContact  ) {
          throw new IllegalStateException("Payer id must be an integer greater than zero.");
        } else {
          User payer = (User) bareUserDAO.find(
            isPayerIdGiven ? this.getPayerId() : contact.getBusinessId() != 0 ? contact.getBusinessId() : contact.getId());
          if ( payer == null && ( contact == null || contact.getBusinessId() != 0 ) ) {
            throw new IllegalStateException("No user, contact, or business with the provided payerId exists.");
          }
          // TODO: Move user checking to user validation service
          if ( payer != null && AccountStatus.DISABLED == payer.getStatus() ) {
            throw new IllegalStateException("Payer user is disabled.");
          }
        }
      `
    }
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function(status) {
        return false;
        // return status !== this.InvoiceStatus.PAID && this.lookup('net.nanopay.interac.ui.etransfer.TransferWizard', true);
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
  targetDAOKey: 'invoiceDAO',
  sourceDAOKey: 'bareUserDAO',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Vendor',
    documentation: `The receiver of the amount stated in the invoice.`,
    required: true,
    view: function(_, X) {
      return {
        class: 'foam.u2.view.RichChoiceView',
        selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
        rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
        sections: [
          {
            heading: 'Users',
            dao: X.userDAO
          }
        ]
      };
    },
    searchView: {
      class: 'foam.u2.search.GroupBySearchView',
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise(function(resolve, reject) {
          dao.find(key).then(function(user) {
            resolve(user ? user.toSummary() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.add(value ? value.toSummary() : 'N/A');
    },
    javaToCSV: `
      User payee = ((Invoice)obj).findPayeeId(x);
      outputter.outputValue(payee.toSummary());
    `,
    javaToCSVLabel: `
      outputter.outputValue("Payee");
    `
  },
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.invoice.model.Invoice',
  forwardName: 'expenses',
  inverseName: 'payerId',
  targetDAOKey: 'invoiceDAO',
  sourceDAOKey: 'bareUserDAO',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Customer',
    documentation: '(REQUIRED) Payer of the amount stated in the invoice.',
    required: true,
    view: function(_, X) {
      return {
        class: 'foam.u2.view.RichChoiceView',
        selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
        rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
        sections: [
          {
            heading: 'Users',
            dao: X.userDAO
          }
        ]
      };
    },
    searchView: {
      class: 'foam.u2.search.GroupBySearchView',
      width: 40,
      aFormatLabel: function(key) {
        var dao = this.__context__.userDAO;
        return new Promise( function(resolve, reject) {
          dao.find(key).then( function(user) {
            resolve(user ? user.toSummary() : 'Unknown User: ' + key);
          });
        });
      },
      viewSpec: { class: 'foam.u2.view.ChoiceView', size: 14 }
    },
    tableCellFormatter: function(value, obj, rel) {
      this.add(value ? value.toSummary() : 'N/A');
    },
    javaToCSV: `
    User payer = ((Invoice)obj).findPayerId(x);
    outputter.outputValue(payer.toSummary());
    `,
    javaToCSVLabel: `
    outputter.outputValue("Payer");
    `
  },
});
