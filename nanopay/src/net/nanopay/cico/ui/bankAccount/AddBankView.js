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
  package: 'net.nanopay.cico.ui.bankAccount',
  name: 'AddBankView',
  extends: 'foam.u2.View',

  documentation: 'View for adding a shopper through the wizard view flow',

  properties: [
    'startAtValue',
    'wizardTitle',
    'backLabelValue',
    'nextLabelValue',
    'onComplete'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .tag({
            class: 'net.nanopay.cico.ui.bankAccount.form.BankForm',
            title: this.wizardTitle,
            startAt: this.startAtValue,
            backLabel: this.backLabelValue,
            nextLabel: this.nextLabelValue,
            onComplete: this.onComplete
          })
        .end();
    }
  ]
});
