foam.CLASS({
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferDetails',
  extends: 'net.nanopay.interac.ui.etransfer.TransferView',

  documentation: 'Interac transfer details',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .property-notes {
          box-sizing: border-box;
          width: 320px;
          height: 66px;
          overflow-y: scroll;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          resize: vertical;

          padding: 8px;
          outline: none;
        }

        ^ .property-notes:focus {
          border: solid 1px #59A5D5;
        }

        ^ .foam-u2-tag-Select {
          width: 320px;
          height: 40px;
          border-radius: 0;

          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;

          padding: 12px 20px;
          border: solid 1px rgba(164, 179, 184, 0.5);
          background-color: white;
          outline: none;
        }

        ^ .purposeContainer {
          position: relative;
          margin-bottom: 20px;
        }

        ^ .foam-u2-tag-Select:hover {
          cursor: pointer;
        }

        ^ .foam-u2-tag-Select:focus {
          border: solid 1px #59A5D5;
        }

        ^ .caret {
          position: relative;
        }

        .caret:before {
          content: '';
          position: absolute;
          top: -23px;
          left: 295px;
          border-top: 7px solid #a4b3b8;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
        }

        .caret:after {
          content: '';
          position: absolute;
          left: 12px;
          top: 0;
          border-top: 0px solid #ffffff;
          border-left: 0px solid transparent;
          border-right: 0px solid transparent;
        }
      */}
    })
  ],

  messages: [
    { name: 'TransferFromLabel', message: 'Transfer from' },
    { name: 'AccountLabel', message: 'Account' },
    { name: 'ToLabel', message: 'To' },
    { name: 'FromLabel', message: 'From' },
    { name: 'PayeeLabel', message: 'Payee' },
    { name: 'PurposeLabel', message: 'Purpose of Transfer' },
    { name: 'NoteLabel', message: 'Notes (Optional)' },
    { name: 'InvoiceNoLabel', message: 'Invoice No.' },
    { name: 'PONoLabel', message: 'PO No.' },
    { name: 'PDFLabel', message: 'View Invoice PDF' }
  ],

  properties: [
    {
      // TODO: create a DAO to store these values so they can be more easily extended.
      name: 'purpose',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'General',
          'Other'
        ],
      },
      factory: function() {
        this.viewData.purpose = 'General';
        return 'General';
      },
      postSet: function(oldValue, newValue) {
        switch(newValue) {
          case 'General' :
            this.viewData.purpose = 'General';
            break;
          case 'Other' :
            this.viewData.purpose = 'Other';
            break;
        }
      }
    },
    {
      class: 'String',
      name: 'notes',
      postSet: function(oldValue, newValue) {
        this.viewData.notes = newValue;
      },
      view: { class: 'foam.u2.tag.TextArea' }
    },
    {
      // TODO: Pull an actual user/business from a DAO
      name: 'fromUser',
      value: {
        name : 'Mark Woods',
        email : 'smitham.cristina@beahan.ca',
        tel : '+1 (907) 787-2493',
        address : '123 Avenue, Toronto, Ontario, Canada M2G 1K9',
        nationality: 'Canada',
        flag: 'images/canada.svg'
      }
    },
    {
      // TODO: Pull an actual user/business from a DAO
      name: 'toUser',
      value: {
        name : 'Mary Lindsey',
        email : 'haylee_kautzer@gmail.com',
        tel : '+91 11 2588 8257',
        address : '3/1, West Patel Nagar, New Delhi, Delhi 110008, India',
        nationality: 'India',
        flag: 'images/india.svg'
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER()

      if ( this.viewData.purpose ) {
        this.purpose = this.viewData.purpose;
      }

      if ( this.viewData.notes ) {
        this.notes = this.viewData.notes;
      }
    },

    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('detailsCol')
          .start('p').add(this.TransferFromLabel).addClass('bold').end()
          .start('p').add(this.AccountLabel).end()
          .start('p').add(this.ToLabel).addClass('bold').end()
          .start('p').add(this.PayeeLabel).end()
          .start('p').add(this.PurposeLabel).end()
          .start('div').addClass('purposeContainer')
            .tag(this.PURPOSE)
            .start('div').addClass('caret').end()
          .end()
          .start('p').add(this.NoteLabel).end()
          .tag(this.NOTES, { onKey: true })
        .end()
        .start('div').addClass('divider').end()
        .start('div').addClass('fromToCol')
          .start('div').addClass('invoiceDetailContainer').enableClass('hidden', this.invoice$, true)
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.InvoiceNoLabel).end()
            .start('p').addClass('invoiceDetail').add('PLACEHOLDER').end()
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.PONoLabel).end()
            .start('p').addClass('invoiceDetail').add('PLACEHOLDER').end()
          .end()
          .start('a').addClass('invoiceLink').enableClass('hidden', this.invoice$, true)
            .attrs({href: ''})
            .add(this.PDFLabel)
          .end()
          .start('p').add(this.FromLabel).addClass('bold').end()
          // TODO: Make card based on from and to information
          .tag({ class: 'net.nanopay.interac.ui.shared.TransferUserCard', user: this.fromUser })
          .start('p').add(this.ToLabel).addClass('bold').end()
          .tag({ class: 'net.nanopay.interac.ui.shared.TransferUserCard', user: this.toUser })
        .end();
    }
  ]
});
