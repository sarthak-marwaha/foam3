/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.axiom',
  name: 'WizardAction',
  extends: 'foam.core.Action',
  documentation: `
    Creates a distinction for actions that belong to a wizardlet but should
    display at the bottom of a wizard rather than within the wizardlet.
  `,
  properties: [
    {
      name: 'code',
      value: function (slot) {
        const wizardController = slot.data$.get();
        wizardController.goNext();
      }
    },
    {
      name: 'isEnabled',
      value: function (data$canGoNext, isLoading_) {
        return data$canGoNext && ! isLoading_;
      }
    }
  ]
});
