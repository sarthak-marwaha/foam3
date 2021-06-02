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
  package: 'net.nanopay.tx.rbc',
  name: 'RbcInterTrustTransaction',
  extends: 'net.nanopay.tx.cico.InterTrustTransaction',

  implements: [
    'net.nanopay.tx.rbc.RbcTransaction'
  ],

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'rbcReferenceNumber',
      class: 'String'
    },
    {
      name: 'rbcFileCreationNumber',
      class: 'Long'
    },
    {
      name: 'rejectReason',
      class: 'String'
    },
    {
      name: 'institutionNumber',
      class: 'String',
      value: '003',
      visibility: 'Hidden'
    },
    {
      name: 'settled',
      class: 'Boolean'
    }
  ],
  methods: [
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          type: 'net.nanopay.tx.model.Transaction'
        },
      ],
      javaCode: `
        super.limitedCopyFrom(other);
        if ( other instanceof RbcInterTrustTransaction ) {
          setRbcReferenceNumber( ((RbcInterTrustTransaction) other).getRbcReferenceNumber() );
          setRbcFileCreationNumber( ((RbcInterTrustTransaction) other).getRbcFileCreationNumber() );
          setRejectReason( ((RbcInterTrustTransaction) other).getRejectReason() );
          setSettled( ((RbcInterTrustTransaction) other).getSettled() );
        }
      `
    },
    {
      name: 'calculateErrorCode',
      javaCode: `

        if ( getErrorCode() != 0 ) return getErrorCode();
        String reason = getRejectReason();
        if ( SafetyUtil.isEmpty(reason) ) return 0;

        if ( reason.contains("BE16") || reason.contains("RR03") ) {
          setErrorCode(912l);
        } else if ( reason.contains("BE08")  || reason.contains("BE22") ) {
          setErrorCode(914l);
        } else if ( reason.contains("RC09") || reason.contains("RC10")  ) {
          setErrorCode(923l);
        } else {
          setErrorCode(991l);
        }
        return getErrorCode();
      `
    }
  ]
});