package net.nanopay.contacts;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;

import java.util.List;

import static foam.mlang.MLang.EQ;

/**
 * The purpose of this DAO decorator is to prevent users from creating two
 * contacts with the same email address.
 */
public class PreventDuplicateContactEmailDAO extends ProxyDAO {
  public PreventDuplicateContactEmailDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Contact toPut = (Contact) obj;

    if ( toPut == null ) {
      throw new RuntimeException("Cannot put null.");
    }

    Sink sink = new ArraySink();
    sink = getDelegate()
      .where(EQ(Contact.EMAIL, toPut.getEmail().toLowerCase()))
      .limit(1)
      .select(sink);
    List data = ((ArraySink) sink).getArray();

    if ( data.size() == 1 ) {
      Contact existingContact = (Contact) data.get(0);
      if ( existingContact.getId() != toPut.getId() ) {
        throw new RuntimeException("You already have a contact with that email address.");
      }
    }

    return super.put_(x, toPut);
  }
}
