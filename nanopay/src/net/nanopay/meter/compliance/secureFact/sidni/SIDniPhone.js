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
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniPhone',

  documentation: `The Phone object for SIDni`,

  properties: [
    {
      class: 'String',
      name: 'type',
      required: true,
      documentation: 'Type of phone number; must be Home, Mobile, or Work.'
    },
    {
      class: 'String',
      name: 'number',
      required: true,
      documentation: 'The phone number. 10 digit only, no dashes.'
    },
  ]
});
