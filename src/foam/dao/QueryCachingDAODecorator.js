/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.dao',
  name: 'QueryCachingDAODecorator',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Javascript DAO Decorator which adds select caching to a delegate DAO.',

  constants: [
    {
      name: 'PURGE',
      value: 'PURGE'
    }
  ],

  properties: [
    {
      // The cache for local storage and fast access
      name: 'cache',
      factory: function() { return {}; }
    }
  ],

  methods: [
    // Put invalidates cache and is forwarded to the source.
    function put_(x, o) {
      this.cache = {};
      return this.delegate.put_(x, o);
    },

    function select_(x, sink, skip, limit, order, predicate) {
      if (
        // Only cache selects that have limit provided
        limit === undefined
        // Only handle query caching for ArraySink and Projection
        || ! (foam.dao.ArraySink.isInstance(sink) || foam.mlang.sink.Projection.isInstance(sink))
      ) {
        return this.SUPER(x, sink, skip, limit, order, predicate);
      }

      let self = this;
      let key  = [order, predicate].toString();

      return new Promise(function(resolve, reject) {
        //console.log('******** QUERYCACHE: key: ' + key + ' in cache: ' +  ( self.cache[key] ? 'true' : 'false' ));
        let requestStartIdx = typeof skip !== 'undefined' ? skip : 0;
        let requestEndIdx = skip + limit;

        // Ensure we have cache for request
        self.fillCache_(key, requestStartIdx, requestEndIdx, x, sink, order, predicate).then( function() {

          // Return data from cache
          for ( let idx = requestStartIdx; idx < requestEndIdx; idx++ ) {
            sink.put(self.cache[key][idx]);
          }

          resolve(sink);
        });
      });
    },

    // Remove invalidates cache and is forwarded to the source.
    function remove_(x, o) {
      this.cache = {};
      return this.delegate.remove_(x, o);
    },

    // RemoveAll invalidates cache and is forwarded to the source.
    function removeAll_(x, skip, limit, order, predicate) {
      this.cache = {};
      this.delegate.removeAll_(x, skip, limit, order, predicate);
    },

    function cmd_(x, obj) {
      if ( obj === this.PURGE ) {
        this.cache = {};
      } else {
        this.SUPER(x, obj);
      }
    },

    function fillCache_(key, requestStartIdx, requestEndIdx, x, sink, order, predicate) {
      // Pre-check cache for elements
      let startIdx = -1;
      let endIdx = -1;
      let hasMissingData = false;

      if ( this.cache[key] ) {
        // Cycle through exising cached elements to verify all requested are present
        for ( let idx = requestStartIdx; idx < requestEndIdx; idx++ ) {
          if ( ! this.cache[key][idx] ) {
            if ( ! hasMissingData ) {
              // Found start of missing data withing requested block
              hasMissingData = true;
              startIdx = idx;
            }

            // Make sure we have the last index of a missing data element within requested block
            endIdx = idx + 1;
          }
        }
      } else {
        // No data present load entire block
        hasMissingData = true;
        startIdx = requestStartIdx;
        endIdx = requestEndIdx;
        this.cache[key] = [];
      }

      if ( hasMissingData ) {
        //console.log('******** QUERYCACHE*** HAS MISSING DATA ***: key: ' + key + ' startIdx: ' + startIdx + ' endIdx: ' + endIdx);
        let self = this;
        return this.delegate.select_(x, sink, startIdx, endIdx - startIdx, order, predicate).then( function (result) {
          // Update cache with missing data
          for ( let idx = 0; idx < result.array.length; idx++ ) {
            if ( ! self.cache[key][startIdx + idx] ) {
              self.cache[key][startIdx + idx] = result.array[idx];
            }
          }
        });
      }

      return Promise.resolve();
    }
  ]
});

