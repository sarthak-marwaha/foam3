package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import net.nanopay.account.Account;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

// Sends an email when a Bank account is created
public class CanReceiveCurrencyDAO extends ProxyDAO {
  public DAO bareUserDAO;
  public DAO accountDAO;

  public CanReceiveCurrencyDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    bareUserDAO = ((DAO) x.get("bareUserDAO")).inX(x);
    accountDAO = ((DAO) x.get("accountDAO")).inX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj == null ) throw new RuntimeException("Cannot put null.");

    CanReceiveCurrency request = (CanReceiveCurrency) obj;

    User user = (User) bareUserDAO.inX(x).find(request.getUserId());

    // If the user is a contact, should we look up the real user if they exist?
    // Contacts will never have bank accounts, so it makes sense to do that.

    if ( user == null ) {
      throw new RuntimeException("No user found with id " + request.getUserId() + ".");
    }

    Count count = (Count) accountDAO
      .where(AND(
        INSTANCE_OF(BankAccount.getOwnClassInfo()),
        EQ(BankAccount.DENOMINATION, request.getCurrencyId()),
        EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
        EQ(Account.OWNER, request.getUserId())))
      .select(new Count());

    CanReceiveCurrency response = (CanReceiveCurrency) request.fclone();
    response.setResponse(count.getValue() > 0);
    return response;
  }

  @Override
  public FObject find_(X x, Object id) {
    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return new ArraySink();
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    return null;
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {}
}
