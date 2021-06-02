/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
  package: 'net.nanopay.auth.ui',
  name: 'UserTableView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.view.ScrollTableView'
  ],

  imports: [
    'stack'
  ],

  exports: [
    'dblclick'
  ],

  css: `
    ^ .foam-u2-view-TableView-selected {
      background: rgba(89, 165, 213, 0.3) !important;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this
        .start().addClass(this.myClass())
          .start({
            class: 'foam.u2.view.ScrollTableView',
            data$: this.data$
          }).end()
        .end();
    },
    function dblclick(user) {
      this.stack.push({
        class: 'net.nanopay.auth.ui.UserDetailView',
        user: user
      });
    }
  ]
});