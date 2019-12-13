/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AccountDAOCreateView',
  extends: 'foam.comics.v2.DAOCreateView',

  requires: [
    'net.nanopay.account.DigitalAccount',
    'foam.u2.dialog.NotificationMessage'
  ],

  documentation: `
    A configurable view to create an instance of a specified model
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return {
          class: 'foam.u2.view.FObjectView',
          of: 'net.nanopay.account.Account'
        };
      }
    },
  ],

  actions: [
    {
      name: 'save',
      code: function() {
        this.data.owner = this.__subContext__.user.id;
        this.data.enabled = true;
        this.config.dao.put(this.data).then((o) => {
          this.data = o;
          this.finished.pub();
          this.stack.back();
        }, (e) => {
          this.throwError.pub(e);
          this.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    },
  ],
});
