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
  package: 'net.nanopay.partner.bmo',
  name: 'BMOPayableMenuCapabilityRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Grants BMO Payable Menu Capability after Compliance is passed.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.logger.Logger',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          Business business = (Business) obj;
          var crunchService = (CrunchService) x.get("crunchService");
          var subject = new Subject(x);
          subject.setUser(business);
          var subjectX = x.put("subject", subject);
          String bmoPaymentMenuCapId = "1f6b2047-1eef-471d-82e7-d86bdf511375-2";
          crunchService.updateJunction(subjectX, bmoPaymentMenuCapId, null, CapabilityJunctionStatus.GRANTED);
        }

      }, "Grants BMO Payable Meny Capability after business compliance is Passed.");
      `
    }
  ]

});
