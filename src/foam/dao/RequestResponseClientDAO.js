/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RequestResponseClientDAO',
  extends: 'foam.dao.BaseClientDAO',

  requires: [
    'foam.core.Serializable'
  ],

  documentation: `A ClientDAO implementation which publishes its own events upon put/remove.
Suitable for usage against backends that don't support listen(), such as plain HTTP based servers.`,

  methods: [
    function put_(x, obj) {
      var self = this;
      return this.SUPER(null, obj).then(function(obj) {
        self.on.put.pub(obj);
        return obj;
      });
    },

    function remove_(x, obj) {
      var self = this;
      return this.SUPER(null, obj).then(function(o) {
        self.on.remove.pub(obj);
        return o;
      });
    },

    function find_(x, key) {
      return this.SUPER(null, key);
    },

    function select_(x, sink, skip, limit, order, predicate) {
      if ( predicate ) predicate = predicate.partialEval();
      if ( predicate === foam.mlang.predicate.True.create() ) predicate = null;
      if ( ! skip ) skip = 0;
      if ( ! limit ) limit = Number.MAX_SAFE_INTEGER;

      if ( ! this.Serializable.isInstance(sink) ) {
        var self = this;

        return this.SUPER(null, foam.dao.ArraySink.create(), skip, limit, order, predicate).then(function(result) {
          var items = result.array;

          if ( ! sink ) return result;

          var sub = foam.core.FObject.create();
          var detached = false;
          sub.onDetach(function() { detached = true; });

          for ( var i = 0 ; i < items.length ; i++ ) {
            if ( detached ) break;

            sink.put(items[i], sub);
          }

          sink.eof();

          return sink;
        });
      }

      return this.SUPER(null, sink, skip, limit, order, predicate);
    },

    function removeAll_(x, skip, limit, order, predicate) {
      var self = this;

      if ( predicate === foam.mlang.predicate.True.create() ) predicate = null;
      if ( ! skip ) skip = 0;
      if ( foam.Undefined.isInstance(limit) ) limit = Number.MAX_SAFE_INTEGER;

      return this.SUPER(null, skip, limit, order, predicate).then(function() {
        self.on.reset.pub();
        return;
      });
    },

    function listen_(x, sink, predicate) {
      // Avoid the proxy implementation inherited from BaseClientDAO
      // and instead use the default implementation from AbstractDAO.
      return this.__context__.lookup('foam.dao.AbstractDAO').
        prototype.listen_.call(this, x, sink, predicate);
    },

    {
      name: 'cmd_',
      code: function cmd_(x, obj) {
        /** Force the DAO to publish a 'reset' notification. **/
        if ( foam.dao.DAO.RESET_CMD === obj ) {
          this.on.reset.pub();
          return true;
        }
//        ctrl.__subContext__.nSpecDAO.select(ns => { if ( ns.name.indexOf('DAO') == -1 ) return; try { var count = ctrl.__subContext__[ns.name].cmd(foam.dao.DAO.COUNT_LISTENERS_CMD); if ( count ) console.log(ns.name, count); } catch(x) {}});
        if ( foam.dao.DAO.COUNT_LISTENERS_CMD === obj ) {
          // pub() returns the number of listeners
          return this.on.pub('ping');
        }
        if ( foam.dao.DAO.PURGE_CMD === obj ) {
          return obj;
        }
        return this.SUPER(x, obj);
      }
    }
  ]
});
