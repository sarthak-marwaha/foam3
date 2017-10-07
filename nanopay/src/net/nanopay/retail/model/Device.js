supressWarnings([

'Unknown property foam.core.Model.searchColumns: ',
'Unknown property foam.core.Model.tableColumns: name,type,serialNumber,status',
'Unknown property foam.core.Model.tableColumns: id,payerName,nextInvoiceDate,amount,frequency,endsAfter,status',
'Unknown property foam.core.String.view: [object Object]'

])
foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'Device',
  ids: ['serialNumber'],

  tableColumns: ['name', 'type', 'serialNumber', 'status'],

  properties: [
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'type',
      required: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.retail.model.DeviceStatus',
      name: 'status'
    },
    {
      class: 'String',
      name: 'serialNumber',
      label: 'Serial No.',
      required: true
    }
  ]
});
