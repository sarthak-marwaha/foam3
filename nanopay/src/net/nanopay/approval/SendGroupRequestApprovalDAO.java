package net.nanopay.approval;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;

/**
 * Populates "points" property for new requests based on approver user.
 * When approvalRequest.group property is set, creates a new ApprovalRequest object for each user in the group and puts it to approvalDAO.
 * When approvalRequest.approver property is set, approvalRequest.group is ignored.
 * The original object is returned and should not be used for any operations.
 */

public class SendGroupRequestApprovalDAO
extends ProxyDAO {

  public SendGroupRequestApprovalDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    ApprovalRequest request = (ApprovalRequest) obj;
    ApprovalRequest oldRequest = (ApprovalRequest) ((DAO) getX().get("approvalRequestDAO")).find(obj);

    if ( oldRequest != null ) {
      return super.put_(x, obj);
    }
    User approver = request.findApprover(getX());

    if ( approver != null ) {
      request.setPoints(findUserPoints(approver));
      return super.put_(x, request);
    }

    Group group = request.findGroup(getX());

    if ( group == null ) {
      throw new RuntimeException("Approver or approver group must be set for approval request");
    }

    group.getUsers(getX()).select(new AbstractSink() {

      @Override
      public void put(Object obj, Detachable sub) {
        sendSingleRequest(request, ((User)obj).getId());
      }

    });
    return obj;
  }

  private void sendSingleRequest(ApprovalRequest req, long userId) {
    ApprovalRequest request = (ApprovalRequest) req.fclone();
    request.clearId();
    request.setApprover(userId);
    ((DAO) getX().get("approvalRequestDAO")).put(request);
  }

  private int findUserPoints(User user) {
    // TODO: find user points based on spid/role/group/configurations
    return 1;
  }
}
