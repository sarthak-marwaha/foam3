foam.CLASS({
  package: 'net.nanopay.invoice.dao',
  name: 'Dao',

  documentation: 'Creates Invoice related DAO\'s.',

  requires: [
    'foam.dao.ContextualizingDAO',
    'foam.dao.DecoratedDAO',
    'foam.dao.ClientDAO',
    'foam.dao.EasyDAO',
    'net.nanopay.invoice.model.Invoice',
    'foam.box.HTTPBox'
  ],

  exports: [
    'invoiceDAO'
  ],

  properties: [
    {
      name: 'invoiceDAO',
      factory: function() {
        /*this.DecoratedDAO.create({
          decorator: this.InvoiceDecorator.create(),
          delegate: */
        return this.createDAO({
            of: 'net.nanopay.invoice.model.Invoice',
            seqNo: true
          })
          .addPropertyIndex(this.Invoice.STATUS)
          .addPropertyIndex(this.Invoice.TO_USER_NAME)
          .addPropertyIndex(this.Invoice.FROM_USER_NAME)
          .addPropertyIndex(this.Invoice.TO_USER_ID)
          .addPropertyIndex(this.Invoice.FROM_USER_ID);
      }
    }
  ]
  
});