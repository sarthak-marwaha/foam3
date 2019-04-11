foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'AccountingIntegrationUtil',

  documentation: 'Manages the front-end common logic for Accounting Integrations',

  requires: [
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.AccountingErrorCodes',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.accounting.AccountingResultReport'
  ],

  imports: [
    'accountingReportDAO',
    'contactDAO',
    'ctrl',
    'invoiceDAO',
    'quickbooksService',
    'userDAO',
    'xeroService',
    'user'
  ],

  exports: [
    'showIntegrationModal'
  ],

  messages: [
    { name: 'MISSING_CONTACT', message: 'Missing Contact' },
    { name: 'INVALID_CURRENCY', message: 'Invalid Currency' },
    { name: 'UNAUTHORIZED_INVOICE', message: 'Unauthorized Xero Invoice' },
    { name: 'MISSING_BUSINESS_EMAIL', message: 'Missing Business Name & Email' },
    { name: 'MISSING_BUSINESS', message: 'Missing Business Name' },
    { name: 'MISSING_EMAIL', message: 'Missing Email' },
    { name: 'OTHER', message: 'Other' },
    { name: 'EXISTING_USER_CONTACT', message: 'There is a contact who is also a user with that email.'},
    { name: 'EXISTING_CONTACT', message: 'There is an existing contact with that email.'},
    { name: 'EXISTING_USER', message: 'There is already a user with that email.'},
    { name: 'EXISTING_USER_MULTI', message: 'The user belongs to multiple businesses.'}
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showIntegrationModal'
    }
  ],

  methods: [
    async function doSync(view) {
      // find the service
      let service = null;

      if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
        service = this.xeroService;
      }
      if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
        service = this.quickbooksService;
      }

      // contact sync
      let contactResult = await service.contactSync(null);
      if ( contactResult.errorCode === this.AccountingErrorCodes.TOKEN_EXPIRED ) {
        this.ctrl.add(this.Popup.create({ closeable: false }).tag({
          class: 'net.nanopay.accounting.AccountingTimeOutModal'
        }));
        return null;
      }
      if ( ! contactResult.result ) {
        this.ctrl.notify(contactsResult.reason, 'error');
      }

      // invoice sync
      let invoiceResult = await service.invoiceSync(null);
      if ( ! invoiceResult.result ) {
        this.ctrl.notify(contactsResult.reason, 'error');
      }

      // build final result
      let finalResult = contactResult.clone();
      finalResult.invoiceErrors = invoiceResult.invoiceErrors;
      finalResult.successInvoice = invoiceResult.successInvoice;
      this.ctrl.notify('All information has been synchronized', 'success');
      
      let report = this.AccountingResultReport.create();
      report.userId = this.user.id;
      report.time = new Date();
      report.resultResponse = finalResult;
      this.accountingReportDAO.put(report);

      return finalResult;
    },


    async function forceSyncInvoice(invoice) {
      this.showIntegrationModal = false;
      let service = null;
      let accountingSoftwareName = null;
      if ( this.XeroInvoice.isInstance(invoice) && this.user.id == invoice.createdBy &&(invoice.status == this.InvoiceStatus.UNPAID || invoice.status == this.InvoiceStatus.OVERDUE) ) {
        service = this.xeroService;
        accountingSoftwareName = 'Xero';
      } else if ( this.QuickbooksInvoice.isInstance(invoice) && this.user.id == invoice.createdBy &&(invoice.status == this.InvoiceStatus.UNPAID || invoice.status == this.InvoiceStatus.OVERDUE) ) {
        service = this.quickbooksService;
        accountingSoftwareName = 'Quickbooks';
      }
      if ( service != null ) {
        let result = await service.singleInvoiceSync(null, invoice);
        if ( ! result.result ) {
          if ( result.errorCode === this.AccountingErrorCodes.TOKEN_EXPIRED || result.errorCode === this.AccountingErrorCodes.NOT_SIGNED_IN || result.errorCode === this.AccountingErrorCodes.INVALID_ORGANIZATION ) {
            this.ctrl.add(this.Popup.create({ onClose: this.callback.bind(this) }).tag({
              class: 'net.nanopay.accounting.ui.AccountingInvoiceSyncModal',
              businessName: invoice.businessName == '' ? null : invoice.businessName,
              accountingSoftwareName: accountingSoftwareName
            }));
          } else {
            this.ctrl.notify(result.reason, 'error');
          }
          return null;
        }
        return await this.invoiceDAO.find(invoice);
      } else if ( service == null ) {
        return invoice;
      }
    },
    function callback() {
      if ( this.showIntegrationModal ) {
        this.ctrl.add(this.Popup.create().tag({
          class: 'net.invoice.ui.modal.IntegrationModal'
        }));
      }
    },

    function genPdfReport(reportResult) {
      let doc = new jsPDF();
      doc.myY = 20;

      this.createContactMismatchTable(reportResult.contactSyncMismatches, doc);
      this.createContactErrorsTables(reportResult.contactErrors, doc);
      this.createInvoiceErrorsTables(reportResult.invoiceErrors, doc);

      doc.save('table.pdf')
    },

    function createContactMismatchTable(mismatch, doc) {
      if ( mismatch.length == 0 ) {
        return;
      }

      let columns = [
        { header: 'Business', dataKey: 'businessName' },
        { header: 'Name', dataKey: 'name' },
        { header: 'Message', dataKey: 'message' }
      ];

      let data = [];

      for ( item of mismatch ) {
        data.push({
          businessName: item.existContact.businessName,
          name: item.existContact.firstName + ' ' + item.existContact.lastName,
          message: this.getMessage(item.resultCode.name)
        });
      }

      doc.text('Ablii User', 14, doc.myY);
      doc.autoTable({
        columns: columns,
        body: data,
        startY: doc.myY + 3
      });

      doc.myY = doc.autoTable.previous.finalY + 20;
    },

    function createContactErrorsTables(contactErrors, doc) {
      let printTitle = true;
      let removeLastItem = false;
      let columns = [
        { header: 'Business', dataKey: 'businessName' },
        { header: 'Name', dataKey: 'name' }
      ];
      for ( key of Object.keys(contactErrors) ) {
        if ( key === 'OTHER' ) {
          removeLastItem = true;
          columns.push({ header: 'Message', dataKey: 'message' });
        }
        if ( contactErrors[key].length !== 0 ) {
          if ( printTitle ) {
            doc.text('Contact Sync Errors', 16, doc.myY);
            doc.myY = doc.myY + 10;
            printTitle = false;
          }
          doc.text(this.getTableName(key), 14, doc.myY);
          doc.autoTable({
            columns: columns,
            body: contactErrors[key],
            startY: doc.myY + 3
          });
          doc.myY = doc.autoTable.previous.finalY + 10;
        }
        if ( removeLastItem ) {
          columns.pop();
          removeLastItem = false;
        }
      }
    },

    function createInvoiceErrorsTables(invoiceErrors, doc) {
      let printTitle = true;
      let columns = [
        { header: 'Invoice No.', dataKey: 'invoiceNumber'},
        { header: 'Amount', dataKey: 'Amount'},
        { header: 'Due date', dataKey: 'dueDate'}
      ];

      for ( key of Object.keys(invoiceErrors) ) {
        if ( invoiceErrors[key].length !== 0 ) {
          if ( printTitle ) {
            doc.text('Invoice Sync Errors', 16, doc.myY);
            doc.myY = doc.myY + 10;
            printTitle = false;
          }
          doc.text(this.getTableName(key), 14, doc.myY);
          doc.autoTable({
            columns: columns,
            body: invoiceErrors[key],
            startY: doc.myY + 3
          });
          doc.myY = doc.autoTable.previous.finalY + 10;
        }
      }
    },

    function getTableName(key) {
      switch ( key ) {
        case 'MISS_CONTACT':
          return this.MISSING_CONTACT;
        case 'CURRENCY_NOT_SUPPORT':
          return this.INVALID_CURRENCY;
        case 'UNAUTHORIZED_INVOICE':
          return this.UNAUTHORIZED_INVOICE;
        case 'MISS_BUSINESS_EMAIL':
          return this.MISSING_BUSINESS_EMAIL;
        case 'MISS_BUSINESS':
          return this.MISSING_BUSINESS;
        case 'MISS_EMAIL':
          return this.MISSING_EMAIL;
        default:
          return this.OTHER;
      }
    },

    function getMessage(key) {
      switch ( key ) {
        case 'EXISTING_USER_CONTACT':
          return this.EXISTING_USER_CONTACT;
        case 'EXISTING_CONTACT':
          return this.EXISTING_CONTACT;
        case 'EXISTING_USER':
          return this.EXISTING_USER;
        case 'EXISTING_USER_MULTI':
          return this.EXISTING_USER_MULTI;
      }
    }
  ]
});
