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
  package: 'net.nanopay.interac.model',
  name: 'Pacs008ISOPurpose',

  documentation: 'Pacs.008 ISO Purpose Codes',

  ids: [ 'code' ],

  properties: [
    {
      class: 'String',
      name: 'type',
      required: true
    },
    {
      class: 'String',
      name: 'code',
      required: true
    },
    {
      class: 'String',
      name: 'classification',
      required: true
    },
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'definition',
      required: true
    }
  ]
});
