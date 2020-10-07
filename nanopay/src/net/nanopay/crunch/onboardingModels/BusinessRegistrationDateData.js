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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BusinessRegistrationDateData',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  sections: [
    {
      name: 'businessRegistrationDateSection',
      title: 'Enter business registration date',
      help: 'Enter business registration date'
    },
  ],

  messages: [
    { name: 'BUSINESS_REGISTRATION_DATE_ERROR', message: 'Cannot be future dated.' }
  ],

  properties: [
    {
      section: 'businessRegistrationDateSection',
      name: 'businessRegistrationDate',
      label: 'Business Registration Date',
      class: 'Date',
      documentation: 'Date of Business Registration.',
      validationPredicates: [
        {
          args: ['businessRegistrationDate'],
          predicateFactory: function(e) {
            var min = new Date();
            var max = new Date();
            min.setDate(min.getDate() - ( 350 * 365 ));
            return e.AND(
              e.NEQ(net.nanopay.crunch.onboardingModels.BusinessRegistrationDateData.BUSINESS_REGISTRATION_DATE, null),
              e.GTE(net.nanopay.crunch.onboardingModels.BusinessRegistrationDateData.BUSINESS_REGISTRATION_DATE, min),
              e.LTE(net.nanopay.crunch.onboardingModels.BusinessRegistrationDateData.BUSINESS_REGISTRATION_DATE, max)
            );
          },
          errorMessage: 'BUSINESS_REGISTRATION_DATE_ERROR'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }
      `
    }
  ]
});
