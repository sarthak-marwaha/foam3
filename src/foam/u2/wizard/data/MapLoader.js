/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'MapLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',

  requires: [
    'foam.u2.wizard.data.CreateLoader'
  ],

  properties: [
    {
      class: 'Object',
      name: 'args',
      expression: function (spec) {
        const cloned = { ...spec };
        delete cloned.class;
        return cloned;
      }
    },
    {
      name: 'delegate',
      factory: function () {
        return this.CreateLoader.create({
          spec: { class: 'foam.core.MapHolder' }
        });
      }
    }
  ],

  methods: [
    async function load(...a) {
      const target = await this.delegate.load(...a);
      for ( const k in this.args ) {
        let loader = this.args[k];
        // If it's not an FObject, parse it
        if ( ! foam.core.FObject.isInstance(loader) ) {
          console.log('before parse of', loader)
          loader = foam.json.parse(loader, undefined, this.__subContext__);
          console.log('after parse');
        }

        target.value[k] = await loader.load({});
      }

      return target;
    }
  ]
});
