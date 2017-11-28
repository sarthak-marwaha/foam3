foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TransferView',
  extends: 'foam.u2.Controller',

  documentation: "View to Transfer Amounts From User to User",

  imports: [
    'user',
    'transactionDAO'
  ],

  requires: [
    'net.nanopay.model.Account',
    'foam.nanos.auth.User',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.ui.NotificationMessage'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 992px;
          margin: auto;
        }
        ^ .label{
          margin-left: 0;
          margin-top: 15px;
        }
        ^ .foam-u2-tag-Select{
          width: 100%;
          height: 40px;
          border-radius: 0;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          padding: 0 15px;
          border: solid 1px rgba(164, 179, 184, 0.5);
          background-color: white;
          outline: none;
        }
        ^ .caret {
          position: relative;
        }
        ^ .caret:before {
          content: '';
          position: absolute;
          top: -22px;
          left: 420px;
          border-top: 7px solid #a4b3b8;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
        }
        ^ .caret:after {
          content: '';
          position: absolute;
          left: 12px;
          top: 0;
          border-top: 0px solid #ffffff;
          border-left: 0px solid transparent;
          border-right: 0px solid transparent;
        }
        ^ .white-container{
          width: 450px;
          height: 380px;
          margin: auto;
          margin-top: 50px;
        }
        ^ .half-small-input-box{
          width: 100%;
        }
        ^ .light-roboto-h2{
          margin-left: 150px;
          margin-bottom: 15px;
        }
        ^ .btn{
          margin-top: 25px;
        }
        ^ .property-note {
          height: auto;
        }
        ^ .net-nanopay-ui-ActionView-transferValue {
          margin-right: 0;
        }
      */}
    })
  ],

  properties: [
    'payee',
    {
      class: 'Currency',
      name: 'transferAmount'
    },
    {
      class: 'String',
      name: 'note',
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 80 }
    },
    {
      name: 'payees',
      view: function(_,X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.userDAO,
          objToChoice: function(user) {
            var username = user.firstName + ' ' + user.lastName;
            return [user.id, username + ' - (' + user.email + ')'];
          }
        });
      }
    }
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
      .start().addClass(this.myClass())
        .start().addClass('white-container')
          .start().addClass('light-roboto-h2').add('Transfer Value').end()
          .start().addClass('label').add('Transfer To:').end()
          .start()
            .tag(this.PAYEES)
            .start('div').addClass('caret').end()
          .end()
          .start().addClass('label').add('Transfer Amount:').end()
          .start(this.TRANSFER_AMOUNT).addClass('half-small-input-box').end()
          .start().addClass('label').add('Note:').end()
          .start(this.NOTE).addClass('half-small-input-box').end()
          .start(this.TRANSFER_VALUE).addClass('blue-button btn').end()
        .end()
      .end();
    }
  ],

  actions:[
    {
      name: 'transferValue',
      label: 'Send',
      code: function(X){
        var self = this;

        if ( self.payees == null ) {
          self.add(self.NotificationMessage.create({ message: 'Please select a user to transfer too.', type: 'error' }));
          return;
        }

        if( self.transferAmount == 0 || self.transferAmount == null ) {
          self.add(self.NotificationMessage.create({ message: 'Please enter an amount greater than $0.00.', type: 'error' }));
          return;
        }

        var transaction = self.Transaction.create({
          payeeId: self.payees,
          payerId: self.user.id,
          amount: self.transferAmount,
          notes: self.note
        });

        self.transactionDAO.put(transaction).then(function(response) {
          self.add(self.NotificationMessage.create({ message: 'Value transfer successfully sent!' }));
        }).catch(function(error) {
          self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
        });
      
      }
    }
  ]
});
