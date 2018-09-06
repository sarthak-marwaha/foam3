foam.CLASS({
  package: 'net.nanopay.security',
  name: 'MerkleTree',
  documentation: 'Modelled class for creating Merkle Trees.',

  javaImports: [
    'java.security.MessageDigest'
  ],

  constants: [
    {
      type: 'int',
      name: 'DEFAULT_SIZE',
      value: 50000
    }
  ],

  properties: [
    {
      class: 'Int',
      name: 'size',
      documentation: 'Size of the Merkle Tree.',
      value: 0
    },
    {
      class: 'Object',
      javaType: 'byte[][]',
      name: 'data',
      documentation: `The array where the incoming hashes are stored prior to
        tree building.`,
      value: null
    },
    {
      class: 'String',
      name: 'hashAlgorithm',
      documentation: 'Algorithm of the hashes being stored in the Merkle Tree.',
      value: 'SHA-256'
    },
    {
      class: 'Boolean',
      name: 'paddedNodes',
      documentation: 'Boolean set to save if the tree was padded with nulls or not.',
      value: false
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
            `private ThreadLocal<MessageDigest> md_ = new ThreadLocal<MessageDigest>() {
              @Override
              protected MessageDigest initialValue() {
                try {
                  return MessageDigest.getInstance(hashAlgorithm_);
                } catch (java.security.NoSuchAlgorithmException e) {
                  throw new RuntimeException(e);
                }
              }

              @Override
              public MessageDigest get() {
                MessageDigest md = super.get();
                md.reset();
                return md;
              }
            };`
        }));
      }
    }
  ],

  methods: [
    {
      name: 'addHash',
      documentation: `This method appends a new hash to the list of hashes that
        need to be built into a Merkle tree.
        @param newHash Hash value that is to be added to the Merkle tree.`,
      args: [
        {
          class: 'Object',
          name: 'newHash',
          javaType: 'byte[]'
        }
      ],
      javaCode: `
        if ( data_ == null ){
          data_ = new byte[DEFAULT_SIZE][newHash.length];
        } else if ( totalDataItems_ == DEFAULT_SIZE ) {
          byte[][] oldData = data_;
          data_ = new byte[totalDataItems_ + DEFAULT_SIZE][newHash.length];

          for ( int i = 0; i < totalDataItems_; i++ ) {
            data_[i] = oldData[i];
          }
        }

        data_[++totalDataItems_] = newHash;`
    },
    {
      name: 'buildTree',
      documentation: `This method builds the Merkle tree from the data that was
        already being pushed to the object. Once the tree is built, the state of
        the object is cleared.
        @return The new Merkle tree that was built.
        @throws NoSuchAlgorithmException`,
      javaReturns: 'byte[][]',
      javaThrows: ['java.security.NoSuchAlgorithmException'],
      javaCode: `
        if ( totalDataItems_ == 0 ) {
          System.err.println("ERROR :: There is no data to build a HashTree.");
          return null;
        }

        byte[][] tree;
        MessageDigest md = md_.get();
        int totalTreeNodes = computeTotalTreeNodes();
        tree = new byte[totalTreeNodes][data_[0].length];

        // copy nodes to the array
        for ( int i = paddedNodes_ ? totalTreeNodes - totalDataItems_ - 1 : totalDataItems_ - 1 ; i < totalTreeNodes; i++ ) {
          if ( paddedNodes_ ) {
            tree[i] = data_[(i - (totalTreeNodes - totalDataItems_)) + 2];
          } else {
            tree[i] = data_[i - (totalTreeNodes - totalDataItems_ - 1) ];
          }
        }

        // make the padded node of the tree null
        if ( paddedNodes_ ) tree[totalTreeNodes - 1] = null;

        // build the tree
        for ( int k = paddedNodes_ ? totalTreeNodes - totalDataItems_ - 2 : totalDataItems_ - 2 ; k >= 0 ; k-- ){
          int leftIndex = 2 * k + 1;
          int rightIndex = 2 * k + 2;

          if ( leftIndex >= totalTreeNodes ){
            /* If the left branch of the node is outOfBounds; then this node is a
                fake node (used for balancing) */
            tree[k] = null;
          } else if ( rightIndex > totalTreeNodes ) {
            /* If the right branch of the node is out of bounds; then treat the left
                branch hash same as the right branch */
            md.update(tree[leftIndex]);
            md.update(tree[leftIndex]);
            tree[k] = md.digest();
          } else {
            // If both branches are within bounds

            if ( tree[leftIndex] == null ){
              // If the left branch of the node is fake; then this node is also fake
              tree[k] = null;
            } else if ( tree[rightIndex] == null ) {
              /* If the right branch of the node is fake; then this node is the
                  double hash of the left branch */
              md.update(tree[leftIndex]);
              md.update(tree[leftIndex]);
              tree[k] = md.digest();
            } else {
              // Default hash is the hash of the left and right branches
              md.update(tree[leftIndex]);
              md.update(tree[rightIndex]);
              tree[k] = md.digest();
            }
          }
        }

        // reset the state of the object prior to returning for the next tree.
        data_ = null;
        totalDataItems_ = 0;

        return tree;`
    },
    {
      name: 'computeTotalTreeNodes',
      documentation: `This method returns the total number of nodes that will be
        required to build the tree. This number includes the number of empty
        nodes that will have to be created in order for the tree to be balanced
        at every level of the tree.
        @return Total number of nodes required to build the Merkle tree.`,
      javaReturns: 'int',
      javaCode: `
        int n = totalDataItems_;
        int nodeCount = 0;

        while ( n >= 1 ){
          nodeCount += computeNextLevelNodes(n);

          double check = n / 2.0;

          /**
           * This is only occur when n = 1; at this point, 1 (for the root) has
           * already been added to nodeCount. Hence, break.
           */
          if ( check <= 0.5 ) break;

          n = (int) Math.ceil(check);
        }

        if ( totalDataItems_ % 2 != 0 ){
          paddedNodes_ = true;
        }

        return nodeCount;
      `
    },
    {
      name: 'computeNextLevelNodes',
      documentation: `This method computes the total number of nodes that the
        next level of the tree should have. The tree must have an even number of
        nodes at every level, even if one of the node is empty.
        @param n The current number of nodes expected at this level of the tree.
        @return The correct number of nodes that should be expected at this
        level of the tree.`,
      args: [
        {
          class: 'Int',
          name: 'n'
        }
      ],
      javaReturns: 'int',
      javaCode: `
        if (n % 2 == 0 || n == 1) {
          return n;
        } else {
          return n + 1;
        }`
    }
  ]

});
