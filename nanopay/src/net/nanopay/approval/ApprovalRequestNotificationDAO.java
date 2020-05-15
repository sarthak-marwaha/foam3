package net.nanopay.approval;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.User;
import net.nanopay.liquidity.LiquidNotification;
import net.nanopay.meter.compliance.ComplianceApprovalRequest;
import static foam.mlang.MLang.*;

public class ApprovalRequestNotificationDAO
extends ProxyDAO {
  public ApprovalRequestNotificationDAO(X x,DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    ApprovalRequest old = (ApprovalRequest) getDelegate().find(obj);
    ApprovalRequest ret = (ApprovalRequest) getDelegate().put_(x, obj);
    String causeDAO = "";
    String notificationType = "";
    String notificationBody = "";


    if ( ret instanceof ComplianceApprovalRequest ) {
      ComplianceApprovalRequest complianceApprovalRequest = (ComplianceApprovalRequest) ret;
      causeDAO = complianceApprovalRequest.getCauseDaoKey();
      notificationType = "approval request for reference id: " + ret.getRefObj() + " cause: " + causeDAO;
      notificationBody = "New approval was requested for reference id: " + ret.getRefObj() + " cause: " + causeDAO;
    } else if ( old != null 
      && ret.getStatus() != old.getStatus()
      && ( ret.getStatus() == ApprovalStatus.APPROVED || ret.getStatus() == ApprovalStatus.REJECTED )
      && ret.getLastModifiedBy() != ret.getApprover()
    ) {
      notificationType = "approval request updated for reference id: " + ret.getRefObj();
      notificationBody = new StringBuilder("Approval request for reference id: ")
        .append(ret.getRefObj())
        .append(" sent to you has been approved by: ")
        .append(ret.getLastModifiedBy())
        .toString();
    } else if ( old == null ) {
      notificationType = "approval request for reference id: " + ret.getRefObj();
      notificationBody = "New approval was requested for reference id: " + ret.getRefObj();
    } else {
      return ret;
    }

    DAO userDAO = (DAO) x.get("localUserDAO");
    User user = (User) userDAO.find(ret.getApprover());
    if ( user != null ) {
      LiquidNotification notification = new LiquidNotification.Builder(x)
        .setUserId(user.getId())
        .setNotificationType(notificationType)
        .setBody(notificationBody)
        .setAction(ret.getOperation().toString())
        .setEntity(ret.getClassification())
        .setDescription(notificationBody)
        .setApprovalStatus(ret.getStatus())
        .build();
      user.doNotify(x, notification);
    }
    
    return ret;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    ApprovalRequest ret = (ApprovalRequest) getDelegate().remove_(x, obj);
    ApprovalRequest fulfilled = (ApprovalRequest) getDelegate().find(AND(
        OR(
          EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED),
          EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED)
        ),
        EQ(ApprovalRequest.CREATED_BY, ret.getCreatedBy()),
        EQ(ApprovalRequest.OBJ_ID, ret.getObjId()),
        EQ(ApprovalRequest.APPROVABLE_HASH_KEY, ret.getApprovableHashKey())
      ));
    if ( fulfilled == null ) return ret;

    String notificationType = new StringBuilder("approval request updated for reference id: ")
      .append(ret.getRefObj())
      .toString();
    String notificationBody = new StringBuilder("Approval request for reference id: ")
      .append(ret.getRefObj())
      .append(" sent to approver: ")
      .append(fulfilled.getApprover())
      .append(" has been approved by: ")
      .append(fulfilled.getLastModifiedBy())
      .toString();

    DAO userDAO = (DAO) x.get("localUserDAO");
    User user = (User) userDAO.find(ret.getApprover());
    if ( user != null ) {
      LiquidNotification notification = new LiquidNotification.Builder(x)
        .setUserId(user.getId())
        .setNotificationType(notificationType)
        .setBody(notificationBody)
        .setAction(fulfilled.getOperation().toString())
        .setEntity(ret.getClassification())
        .setDescription(notificationBody)
        .setApprovalStatus(fulfilled.getStatus())
        .build();
      user.doNotify(x, notification);
    }
    
    return ret;
    
  }
}
