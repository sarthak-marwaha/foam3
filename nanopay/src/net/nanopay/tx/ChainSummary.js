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
  package: 'net.nanopay.tx',
  name: 'ChainSummary',

  javaImports: [
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.integration.ErrorCode',
    'foam.dao.DAO',
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
    },
    {
      class: 'String',
      name: 'category',
    },
    {
      class: 'String',
      name: 'summary',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.integration.ErrorCode',
      targetDAOKey: 'errorCodeDAO',
      name: 'errorCode'
    },
    {
      class: 'String',
      name: 'errorInfo',
      transient: true,
      javaValue:`
        ( getErrorCode() == 0 ) ? "No Error" :
        ( findErrorCode(foam.core.XLocator.get()) == null ) ? "Unknown Error: " + getErrorCode() :
          findErrorCode(foam.core.XLocator.get()).getSummary()
      `
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.category + ' ' + this.status.getName();
      },
      javaCode: `
        return getCategory() + ' ' + getStatus().getName();
      `
    }
  ]
});
