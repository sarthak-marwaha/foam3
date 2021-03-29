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
  package: 'net.nanopay.crunch.compliance',
  name: 'SendNotificationOnPut',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Sends email to compliance when specified UCJ is Granted`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'java.util.HashMap',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            User user = (User) ucj.findSourceId(x);
            Capability capability = (Capability) ucj.findTargetId(x);
            
            Map<String, Object> args = new HashMap<>();

            StringBuilder sb = new StringBuilder();
            sb.append("Capability: ");
            sb.append(capability.getName());
            sb.append(" was updated for user email: ");
            sb.append(user.getEmail());
            sb.append(", ID: ");
            sb.append(String.valueOf(user.getId()));
            sb.append(" with status ");
            sb.append(ucj.getStatus().getLabel());

            String body = sb.toString();

            args.put("email", user.getEmail());
            args.put("status", ucj.getStatus().getLabel());
            args.put("description", body);
            
            try {
              Notification notification = new Notification.Builder(x)
                .setEmailName("onboarding-capability-compliance-notification")
                .setGroup("fraud-ops")
                .setEmailArgs(args)
                .setBody(body)
                .build();
              ((DAO) x.get("localNotificationDAO")).put(notification);
            } catch (Throwable t) {
              ((Logger) x.get("logger")).error("Error sending notification for updated Capability: " + capability.getName(), t);
            }
          }
        }, "SendNotificationOnPut");
      `
    }
  ]
});
