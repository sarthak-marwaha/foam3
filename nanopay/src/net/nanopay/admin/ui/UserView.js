foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'UserView',
  extends: 'foam.u2.View',

  documentation: 'View displaying a table with a list of all shoppers and merchants',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.PopupView',
    'foam.u2.dialog.Popup',
    'foam.nanos.auth.User'
  ],

  exports: [ 
    'as data',
    'filter',
    'filteredUserDAO' 
  ],

  imports: [
    'stack', 'userDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 962px;
          margin: 0 auto;
        }
        ^ .searchIcon {
          position: absolute;
          margin-left: 5px;
          margin-top: 8px;
        }
        ^ .filter-search {
          width: 225px;
          height: 40px;
          border-radius: 2px;
          background-color: #ffffff;
          display: inline-block;
          margin: 0;
          margin-bottom: 30px;
          vertical-align: top;
          border: 0;
          box-shadow:none;
          padding: 10px 10px 10px 31px;
          font-size: 14px;
        }
        ^ .inline-float-right {
          float: right;
          display: inline-block;
        }
        ^ .net-nanopay-ui-ActionView-exportButton {
          position: absolute;
          width: 75px;
          height: 40px;
          opacity: 0.01;
          cursor: pointer;
          z-index: 100;
          margin-right: 5px;
        }
        ^ .net-nanopay-ui-ActionView-sendMoney {
          width: 135px;
          height: 40px;
          background: #59a5d5;
          border: solid 1px #59a5d5;
          display: inline-block;
          color: white;
          margin: 0;
          outline: none;
          float: right;
        }
        ^ .net-nanopay-ui-ActionView-sendMoney:hover {
          background: #3783b3;
          border-color: #3783b3;
        }
        ^ .net-nanopay-ui-ActionView-sendMoney::after {
          content: ' ';
          position: absolute;
          height: 0;
          width: 0;
          border: 6px solid transparent;
          border-top-color: white;
          transform: translate(5px, 5px);
        }
        ^ .net-nanopay-ui-ActionView-addUser {
          background-color: #EDF0F5;
          border: solid 1px #59A5D5;
          color: #59A5D5;
          margin-right: 5px;
          float: right;
        }
        ^ .net-nanopay-ui-ActionView-addUser::after {
          content: ' ';
          position: absolute;
          height: 0;
          width: 0;
          border: 6px solid transparent;
          border-top-color: #59A5D5;
          transform: translate(5px, 5px);
        }
        ^ .popUpDropDown {
          padding: 0;
          z-index: 10000;
          width: 135px;
          height: 60px;
          background: white;
          opacity: 1;
          box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
          position: absolute;
        }
        ^ .popUpDropDown > div {
          width: 135px;
          height: 30px;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          color: #093649;
          line-height: 30px;
        }
        ^ .popUpDropDown > div:hover {
          background-color: #59a5d5;
          color: white;
          cursor: pointer;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Search',
        onKey: true
      }
    },
    { name: 'data', factory: function() { return this.userDAO; }},
    {
      name: 'filteredUserDAO',
      expression: function(data, filter) {
        return data.where(this.OR(this.CONTAINS_IC(this.User.FIRST_NAME, filter), this.CONTAINS_IC(this.User.EMAIL, filter), this.CONTAINS_IC(this.User.TYPE, filter)));
      },
      view: {
        class: 'foam.u2.view.TableView',
        columns: [
          'id', 'firstName', 'email', 'type'
        ]
      }
    },
    'addUserMenuBtn_',
    'sendMoneyMenuBtn_',
    'addUserPopUp_',
    'sendMoneyPopUp_'
  ],

  messages: [
    { name: 'placeholderText', message: 'Looks like their aren\'t any users registered yet. Please add users by clicking the Add User button above.' },
    { name: 'AddShopper', message: 'Add Shopper' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      
      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start().addClass('button-div')
              .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }).addClass('searchIcon').end()
              .start(this.FILTER).addClass('filter-search').end()
              .start(this.SEND_MONEY, null, this.sendMoneyMenuBtn_$).end()
              .start(this.ADD_USER, null, this.addUserMenuBtn_$).end()
              .start().addClass('inline-float-right')
                .start({ class: 'net.nanopay.ui.ActionButton', data: { image: 'images/ic-export.png', text: 'Export' }}).add(this.EXPORT_BUTTON).end()
              .end()
            .end()
          .end()
          .add(this.FILTERED_USER_DAO)
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.userDAO, message: this.placeholderText, image: 'images/person.svg'})
        .end();
    }
  ],

  actions: [
    {
      name: 'exportButton',
      label: 'Export',
      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.ui.modal.ExportModal', exportData: X.filteredUserDAO}));
      }
    },
    {
      name: 'addUser',
      label: 'Add User',
      code: function(X) {
        var self = this;

        self.addUserPopUp_ = foam.u2.PopupView.create({
          width: 135,
          height: 60,
          x: 0,
          y: 40
        })
        self.addUserPopUp_.addClass('popUpDropDown')
          .start('div').add('Add Shopper')
            .on('click', this.addShopper)
          .end()
          .start('div').add('Add Merchant')
            .on('click', this.addMerchant)
          .end()
        self.addUserMenuBtn_.add(self.addUserPopUp_)
      }
    },
    {
      name: 'sendMoney',
      label: 'Send Money',
      code: function(X) {
        var self = this;
        
        self.sendMoneyPopUp_ = foam.u2.PopupView.create({
          width: 135,
          height: 60,
          x: 0,
          y: 40
        })
        self.sendMoneyPopUp_.addClass('popUpDropDown')
          .start('div').add('To Shopper')
            .on('click', this.sendMoneyToShopper)
          .end()
          .start('div').add('To Merchant')
            .on('click', this.sendMoneyToMerchant)
          .end()
        self.sendMoneyMenuBtn_.add(self.sendMoneyPopUp_)
      }
    }
  ],

  listeners: [

    function addShopper() {
      var self = this;
      self.addUserPopUp_.remove();
      self.add(
        self.Popup.create().tag({
          class: 'net.nanopay.admin.ui.form.AddShopperForm',
          title: this.AddShopper
        }).addClass('popup-with-topnav')
      );
    },

    function addMerchant() {
      var self = this;
      self.addUserPopUp_.remove();
    },

    function sendMoneyToShopper() {
      var self = this;
      self.sendMoneyPopUp_.remove();
    },

    function sendMoneyToMerchant() {
      var self = this;
      self.sendMoneyPopUp_.remove();
    }
  ]

});
