foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'NotificationDashboardView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.model.Currency',
    'foam.nanos.notification.NotificationView',
  ],

  imports: [
    'invoiceDAO',
    'currencyDAO',
    'user'
  ],

  css: `
    ^ {
      margin-bottom: 4px;
      border-radius: 4px;
      padding: 8px 0;
    }
    ^message {
      margin-bottom: 8px;
    }
    ^ .date {
      color: #8e9090;
      margin-top: 8px;
    }
  `,

  properties: [
    'data',
    {
      class: 'String',
      name: 'currencyFormatted',
      value: '...',
      documentation: `Used internally to show the formatted currency value.`
    },
    {
      name: 'bodyMsg',
      class: 'String'
    },
    {
      name: 'date',
      class: 'String'
    },
    {
      name: 'icon',
      value: { class: 'foam.u2.tag.Image', data: 'images/canada.svg' }
    }
  ],

  methods: [
    function initE() {
      // Get body msg
      
      this.bodyMsg = this.data.notificationType;
      if ( this.bodyMsg.includes('Invoice') ) {
        this.invoiceDAO.find(this.data.invoiceId).then((invoice) => {
          if ( invoice == null ) this.bodyMsg = 'The invoice for this notification can no longer be found.';
          this.currencyDAO.find(this.data.destinationCurrency)
            .then((currency) => {
            this.currencyFormatted = currency.format(this.data.amount) + ' ' +
              currency.alphabeticCode;
          });
          if ( invoice.payeeId === this.user.id ) {
            var name = invoice.payer.businessName ?
              invoice.payer.businessName :
              invoice.payer.label();
            this.bodyMsg = `Received payment from ${name} for $${invoice.amount/100}`;
          } else {
            var name = invoice.payee.businessName ? invoice.payee.businessName : invoice.payee.label();
            this.bodyMsg = `Sent payment to ${name} for $${invoice.amount/100}`;
          }
        }).catch((_) => {
          this.bodyMsg = ' ';
        });
      } else {
        this.bodyMsg = this.data.body;
      }
      // Get date
      this.date = this.data.issuedDate ?
          this.spliceDateFormatter(this.data.issuedDate.toISOString().slice(0, 10)) : '';

      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('message'))
          .add(this.bodyMsg$)
        .end()
        .start()
          .addClass('date')
          .add(this.date$)
        .end();
      },

    function spliceDateFormatter(dateString) {
      let splitDate = dateString.split('-');
      let date = dateString;
      if ( splitDate.length === 3 ) {
        switch ( parseInt(splitDate[1]) ) {
          case 1:
            date = 'January';
            break;
          case 2:
            date = 'February';
            break;
          case 3:
            date = 'March';
            break;
          case 4:
            date = 'April';
            break;
          case 5:
            date = 'May';
            break;
          case 6:
            date = 'June';
            break;
          case 7:
            date = 'July';
            break;
          case 8:
            date = 'August';
            break;
          case 9:
            date = 'September';
            break;
          case 10:
            date = 'October';
            break;
          case 11:
            date = 'November';
            break;
          case 12:
            date = 'December';
            break;
          default:
            return splitDate;
        }
        return `${date} ${splitDate[2]}, ${splitDate[0]}`;
      }
      return date;
    }
  ]
});
