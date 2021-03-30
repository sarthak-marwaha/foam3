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
  package: 'net.nanopay.ticket',
  name: 'RefundTicket',
  extends: 'foam.nanos.ticket.Ticket',

  documentation: `Transaction reversal request`,

  imports: [
    'subject',
    'notify'
  ],

  requires: [
    'net.nanopay.tx.CreditLineItem',
    'net.nanopay.tx.FeeLineItem',
    'foam.log.LogLevel'
  ],

  messages: [
    { name: 'SUBMIT_FOR_APPROVAL', message: 'Sucessfully submitted.' },
    { name: 'ASSIGN', message: 'Sucessfully assigned.' },
  ],

  sections: [
    {
      name: 'metaSection',
      isAvailable: function(id) {
        return id != 0;
      },
      title: 'Audit',
      permissionRequired: true
    },
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      section: 'infoSection',
      order: 1,
      tableWidth: 100
    },
    {
      class: 'Reference',
      of: 'foam.nanos.ticket.TicketStatus',
      name: 'status',
      value: 'OPEN',
      javaFactory: 'return "OPEN";',
      includeInDigest: true,
      section: 'infoSection',
      order: 3,
      tableWidth: 130,
      createVisibility: 'HIDDEN',
      tableCellFormatter: function(value, obj) {
        obj.ticketStatusDAO.find(value).then(function(status) {
          if (status) {
            this.add(status.label);
          }
        }.bind(this));
      },
      view: function(_, x) {
        return {
          class: 'foam.u2.view.ModeAltView',
          readView: {
            class: 'foam.u2.view.ReferenceView',
            of: 'foam.nanos.ticket.TicketStatus'
          },
          writeView: {
            class: 'foam.u2.view.ChoiceView',
            choices: x.data.statusChoices
          }
        };
      },
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'requestTransaction',
      documentation: `Transaction doing the reversal`,
      section: 'infoSection',
      hidden: true
    },
    {
      class: 'String',
      name: 'comment',
      required: false,
      storageTransient: true,
      section: 'infoSection',
      readVisibility: 'HIDDEN',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.SummaryTransaction',
      targetDAOkey: 'summaryTransactionDAO',
      name: 'refundTransaction',
      label: 'Transaction being Refunded',
      documentation: `Id of the transaction requiring reversal (Summary)`,
      section: 'infoSection',
      createVisibility: 'RO',
      updateVisibility: 'RO',
      readVisibility: 'RO',
    },
    {
      class: 'String',
      name: 'creditAccount',
      documentation: `Id of the creditAccount`,
      section: 'infoSection',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'problemTransaction',
      documentation: `Id of the problem transaction`,
      createVisibility: function(problemTransaction) {
        return (problemTransaction == null) ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RO;
      },
      section: 'infoSection',
      hidden: true
    },
    {
      class: 'Enum',
      of: 'net.nanopay.ticket.RefundStatus',
      name: 'refundStatus',
      section: 'infoSection',
      createVisibility: 'RO',
      readVisibility: 'RO',
      updateVisibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'waiveCharges'
    },
    {
      class: 'String',
      name: 'agentInstructions',
      readVisibility: 'RO',
      updateVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      includeInDigest: true,
      section: 'systemInformation',
      hidden: true
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.FeeLineItem',
      name: 'feeLineItemsAvaliable',
      visibility: 'HIDDEN'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.FeeLineItem',
      name: 'feeLineItemsSelected',
      label: 'Choose Fees to refund',
      view: function(_, X) { 
        if ( X.controllerMode === foam.u2.ControllerMode.EDIT ){
          return {
            class: 'foam.u2.view.MultiChoiceView',
            choices$: X.data.feeLineItemChoices$,
            isValidNumberOfChoices$: X.data.selectedFeeLineItemsIsValid$,
            showValidNumberOfChoicesHelper: false,
            minSelected: 0,
            maxSelected: X.data.feeLineItemChoices.length
          };
        }
        return {
          class: 'foam.u2.view.FObjectArrayView',
          of: net.nanopay.tx.FeeLineItem
        }
      },
      createVisibility: 'HIDDEN',
    },
    {
      class: 'Boolean',
      name: 'selectedFeeLineItemsIsValid',
      visibility: 'HIDDEN',
      value: false
    },
    {
      name: 'feeLineItemChoices',
      visibility: 'HIDDEN',
      expression: function(feeLineItemsAvaliable){
        return feeLineItemsAvaliable.map(feeLineItem => {
          // TODO: add condition if isFinal is implemented for fee line item
          var isFinal = false;
          debugger;
          return [feeLineItem, feeLineItem.toSummary(), isFinal]
        })
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'assignedTo',
      section: 'infoSection',
      label: 'Assigned to',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'postApprovalRuleId',
      visibility: 'HIDDEN',
      networkTransient: true
    },
  ],

  actions: [
    {
      name: 'assignToMe',
      section: 'infoSection',
      isAvailable: function(assignedTo) {
        return assignedTo == 0;
      },
      code: function(X) {
        this.assignedTo = this.subject.user.id;
        this.ticketDAO.put(this).then(ticket => {
          this.notify(this.ASSIGN, '', foam.log.LogLevel.INFO, true);
        }).catch(error => {
          this.notify(error.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'submit',
      section: 'infoSection',
      isAvailable: function(assignedTo, refundStatus) {
        return assignedTo == this.subject.user.id && refundStatus == net.nanopay.ticket.RefundStatus.AVAILABLE;
      },
      code: function(X) {
        this.refundStatus = net.nanopay.ticket.RefundStatus.REQUESTED;
        this.ticketDAO.put(this).then(ticket => {
          this.notify(this.SUBMIT_FOR_APPROVAL, '', foam.log.LogLevel.INFO, true);
        }).catch(error => {
          this.notify(error.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
