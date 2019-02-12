package net.nanopay.onboarding.email;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.nanos.notification.Notification;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;

public class NewBankAccountAddedEmailDAO extends ProxyDAO {
  protected DAO userDAO_;
  protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  public NewBankAccountAddedEmailDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("userDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // Testing if passing obj is a BankAccount and is a new BankAccount
    if ( ! ( obj instanceof BankAccount ) ) {
      return getDelegate().put_(x, obj);
    }
    // Wrapping obj to be recognized as BankAccount obj.
    BankAccount account    = (BankAccount) obj;

    // Check 1: Don't send email if account is not enabled
    if ( ! account.getEnabled() ) {
      return getDelegate().put_(x, obj);
    }
    // Check 2: Doesn't send email if the status of the account isn't verified
    if ( ! BankAccountStatus.VERIFIED.equals(account.getStatus()) ) {
      return getDelegate().put_(x, obj);
    }
    // Gathering additional information
    BankAccount oldAccount = (BankAccount) find_(x, account.getId());

    // Check 3: Under current implentation, BankAccount is added to dao prior verification so oldAccount should exist
    if ( oldAccount == null ) {
      return super.put_(x, obj);
    }
    // Check 4: Don't send email if account has been previously verified
    if ( oldAccount.getStatus().equals(account.getStatus()) ) {
      return getDelegate().put_(x, obj);
    }
    // Gathering additional information
    User        owner      = (User) userDAO_.inX(x).find(account.getOwner());
    PropertyInfo prop = (PropertyInfo) BankAccount.getOwnClassInfo().getAxiomByName("status");
    if ( owner == null ) {
      // log an error since we should be sending an email at this point
      String message = "Email meant for complaince team Error: Account name = "+account.getName();
      Notification notification = new Notification.Builder(x)
        .setTemplate("NOC")
        .setBody(message)
        .build();
      ((DAO) x.get("notificationDAO")).put(notification);
      ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);
    } 
    // Send email only after passing above checks
    EmailService emailService = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    StringBuilder builder = sb.get()
      .append("<p>User added a bankAccount:<p>")
      .append("<ul><li>")
      .append(owner.getLegalName())
      .append(" - ")
      .append(owner.getEmail())
      .append("</li>")
      .append("<li>")
      .append(account.getDenomination())
      .append(" - ")
      .append("Bank Account Name = " + account.getName())
      .append(" - ")
      .append("Bank Account id = " + account.getId())
      .append("</li></ul>");

    message.setTo(new String[] { "enrollment-team@nanopay.net" });
    message.setSubject("User Added Bank Account");
    message.setBody(builder.toString());
    emailService.sendEmail(x, message);

    return account;
  }
}
