/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'EmailTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for verifying email addresses',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.token.Token',
    'foam.nanos.logger.Loggers',
    'foam.nanos.notification.email.EmailMessage',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID'
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode: `
        try {
          DAO tokenDAO = (DAO) getX().get("localTokenDAO");
          DAO userDAO  = (DAO) getX().get("localUserDAO");
          AppConfig appConfig = user.findGroup(getX()).getAppConfig(x);
          String url = appConfig.getUrl();

          Token token = new Token();
          token.setUserId(user.getId());
          token.setExpiry(generateExpiryDate());
          token.setData(UUID.randomUUID().toString());
          token = (Token) tokenDAO.put(token);

          EmailMessage message = new EmailMessage();
          message.setTo(new String[]{user.getEmail()});
          message.setUser(user.getId());
          HashMap<String, Object> args = new HashMap<>();
          args.put("name", user.getFirstName());
          args.put("link", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=/" );
          args.put("templateSource", this.getClass().getName());
          args.put("template", "verifyEmail");
          ((DAO) getX().get("emailMessageDAO")).put(message);
          return true;
        } catch(Throwable t) {
          Loggers.logger(getX(), this).error("generateTokenWithParameters", t);
          return false;
        }
      `
    },
    {
      name: 'processToken',
      javaCode: `
        DAO userDAO = (DAO) getX().get("localUserDAO");
        DAO tokenDAO = (DAO) getX().get("localTokenDAO");
        Calendar calendar = Calendar.getInstance();

        Sink sink = new ArraySink();
        sink = tokenDAO.where(MLang.AND(
          MLang.EQ(Token.USER_ID, user.getId()),
          MLang.EQ(Token.PROCESSED, false),
          MLang.GT(Token.EXPIRY, calendar.getTime()),
          MLang.EQ(Token.DATA, token)
        )).limit(1).select(sink);

        List list = ((ArraySink) sink).getArray();
        if ( list == null || list.size() == 0 ) {
          // token not found
          throw new RuntimeException("Token not found");
        }

        // set token processed to true
        FObject result = (FObject) list.get(0);
        Token clone = (Token) result.fclone();
        clone.setProcessed(true);
        tokenDAO.put(clone);

        // set user email verified to true
        user.setEmailVerified(true);
        userDAO.put(user);
        return true;
      `
    }
  ]
});
