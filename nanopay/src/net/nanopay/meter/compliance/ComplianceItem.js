foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceItem',
  label: 'Compliance Responses',

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  requires: [
    'foam.dao.DAO'
  ],

  documentation: `The Compliance Item`,

  tableColumns: [
    'responseId',
    'type',
    'user',
    'userLabel',
    'created'
  ],

  searchColumns: [
    'user',
    'userLabel',
    'type'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
      targetDAOKey: 'dowJonesResponseDAO',
      name: 'dowJones'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
      targetDAOKey: 'identityMindResponseDAO',
      name: 'identityMind'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
      targetDAOKey: 'securefactLEVDAO',
      name: 'levResponse'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse',
      targetDAOKey: 'securefactSIDniDAO',
      name: 'sidniResponse'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      targetDAOKey: 'userDAO',
      name: 'user',
      label: 'User/Business ID'
    },
    {
      class: 'String',
      name: 'userLabel',
      label: 'Entity Name'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date'
    },
    {
      class: 'Long',
      name: 'responseId',
      transient: true,
      label: 'ID',
      tableWidth: 50,
      expression: function(dowJones, identityMind, levResponse, sidniResponse) {
        if( dowJones ) {
          return dowJones;
        } else if ( identityMind ) {
          return identityMind;
        } else if ( levResponse ) {
          return levResponse;
        } else if ( sidniResponse ) {
          return sidniResponse;
        } else {
          return 0;
        }
      },
      hidden: true
    },
    {
      name: 'type',
      transient: true,
      expression: function(dowJones, identityMind, levResponse, sidniResponse) {
        if ( dowJones ) {
          return this.dowJones$find.then(o => {
            return o.searchType;
          })
        } else if ( identityMind ) {
          return this.identityMind$find.then(o => {
            return "Identity Mind (" + o.apiName + ")";
          })
        } else if ( levResponse ) {
          return "Secure Fact (LEV)";
        } else if ( sidniResponse ) {
          return "Secure Fact (SIDni)";
        } else {
          return "";
        }
      },
      tableWidth: 300
    }
  ]
});
