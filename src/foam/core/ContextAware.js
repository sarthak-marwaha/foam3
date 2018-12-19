/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.core',
  name: 'ContextAware',
  methods: [
    {
      name: 'getX',
      returns: 'Context'
    },
    {
      name: 'setX',
      returns: 'Void',
      args: [ { name: 'x', type: 'Context' } ]
    }
  ]
});
