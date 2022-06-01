/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailFolderAgent',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  implements: [
    'foam.core.ContextAgent'
  ],

  documentation: `Agent which retrieves a email folders messages`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.om.OMLogger',
    'java.util.Date',
    'java.util.Properties',
    'javax.mail.*',
    'javax.mail.Message',
  ],

  javaCode: `
  public EmailFolderAgent() {}

  public EmailFolderAgent(X x) {
    this(x, (SMTPConfig) x.get("SMTPConfig"));
  }

  public EmailFolderAgent(X x, SMTPConfig config) {
    this(x, config.getUsername(), config.getPassword())
  }

  public EmailFolderAgent(X x, String username, String password) {
    this(x, username, password, "INBOX");
  }

  public EmailFolderAgent(X x, String username, String password, String folderName) {
    setX(x);
    setUsername(username);
    setPassword(password);
    setFolderName(folderName);
  }
  `,

  properties: [
    {
      name: 'protocol',
      class: 'String',
      value: 'imaps'
    },
    {
      name: 'host',
      class: 'String',
      value: 'imap.gmail.com'
    },
    {
      name: 'port',
      class: 'String',
      value: '993'
    },
    {
      name: 'username',
      class: 'String'
    },
    {
      name: 'password',
      class: 'String'
    },
    {
      name: 'authenticate',
      class: 'Boolean',
      value: true
    },
    {
      name: 'starttls',
      class: 'Boolean',
      value: true
    },
    {
      name: 'folderName',
      class: 'String',
      value: 'INBOX'
    },
    {
      name: 'delete',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    {
      name: 'execute',
      args: 'X x',
      javaCode: `
        Logger logger = new PrefixLogger(
          new Object[] {
            this.getClass().getSimpleName(),
            getUsername(),
            getFolderName()
          },
          (Logger) x.get("logger")
        );
        OMLogger omLogger = (OMLogger) x.get("OMLogger");
        Store store = null;
        Folder folder = null;
        try {
          omLogger.log(this.getClass().getSimpleName(), "store", "connecting");
          Properties props = new Properties();
          props.setProperty("mail.store.protocol", getProtocol());
          props.setProperty("mail.smtp.auth", getAuthenticate() ? "true" : "false");
          props.setProperty("mail.smtp.starttls.enable", getStarttls() ? "true" : "false");
          props.setProperty("mail.smtp.host", getHost());
          props.setProperty("mail.smtp.port", getPort());
          Session session = Session.getInstance(props);
          store = session.getStore(getProtocol());
          try {
            store.connect(getHost(), Integer.valueOf(getPort()), getUsername(), getPassword());
          } catch ( Exception e ) {
            logger.warning("store", "connection", "failed", e.getMessage());
            throw e;
          }
          omLogger.log(this.getClass().getSimpleName(), "store", "connected");

          folder = store.getFolder(getFolderName());
          if ( getDelete() ) {
            folder.open(Folder.READ_WRITE);
          } else {
            folder.open(Folder.READ_ONLY);
          }

          DAO dao = (DAO) x.get("emailMessageDAO");
          Message[] messages = folder.getMessages();
          logger.debug("messages", messages.length);
          for ( Message message : messages ) {
            dao.put(buildEmailMessage(x, message));
            message.setFlag(Flags.Flag.DELETED, getDelete());
          }
        } catch ( Exception e ) {
          logger.error(e);
          throw new RuntimeException(e);
        } finally {
          try {
            if ( folder != null ) folder.close(getDelete());
            if ( store != null ) store.close();
          } catch (Exception e) {
            logger.warning("Exception closing resources", e.getMessage());
          }
        }
      `
    },
    {
      name: 'buildEmailMessage',
      args: 'X x, javax.mail.Message message',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaThrows: [ 'javax.mail.MessagingException' ],
      javaCode: `
        EmailMessage emailMessage = new EmailMessage();
        emailMessage.setSubject(message.getSubject());
        emailMessage.setFrom(message.getFrom()[0].toString());
        emailMessage.setReplyTo(message.getReplyTo()[0].toString());

        Address[] addresses = message.getRecipients(Message.RecipientType.TO);
        if ( addresses != null && addresses.length > 0 ) {
          String[] recipients = new String[addresses.length];
          for ( int i = 0; i < addresses.length; i++ ) {
            recipients[i] = addresses[i].toString();
          }
          emailMessage.setTo(recipients);
        }
        addresses = message.getRecipients(Message.RecipientType.CC);
        if ( addresses != null && addresses.length > 0 ) {
          String[] recipients = new String[addresses.length];
          for ( int i = 0; i < addresses.length; i++ ) {
            recipients[i] = addresses[i].toString();
          }
          emailMessage.setCc(recipients);
        }
        addresses = message.getRecipients(Message.RecipientType.BCC);
        if ( addresses != null && addresses.length > 0 ) {
          String[] recipients = new String[addresses.length];
          for ( int i = 0; i < addresses.length; i++ ) {
            recipients[i] = addresses[i].toString();
          }
          emailMessage.setBcc(recipients);
        }
        emailMessage.setSentDate(message.getSentDate());
        emailMessage.setStatus(Status.RECEIVED);

        // TODO: Part, Multipart body, attachments

        return emailMessage;
      `
    }
  ]
});
