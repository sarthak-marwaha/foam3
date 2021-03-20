/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  name: 'BusinessValidationException',
  package: 'net.nanopay.business',
  extends: 'foam.core.ClientRuntimeException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  messages: [
    {
      name: 'EXCEPTION_MESSAGE',
      message: 'There was an issue creating the business'
    },
  ],

  properties: [
    {
      documentation: 'java message template',
      name: 'javaExceptionMessage',
      class: 'String',
      value: 'There was an issue creating the business',
      transient: true
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public BusinessValidationException() {
    super();
  }

  public BusinessValidationException(Exception cause) {
    super(cause);
  }
        `);
      }
    }
  ]
});
