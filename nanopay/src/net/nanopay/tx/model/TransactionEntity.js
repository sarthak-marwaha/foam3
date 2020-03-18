foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TransactionEntity',
  documentation: `This model represents the payer/payee of a transaction and is meant to storage transient.`,

  requires: ['net.nanopay.model.Business'],

  javaImports: ['foam.nanos.auth.User'],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'firstName',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'lastName',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'fullName',
      expression: function(firstName, lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    },
    {
      class: 'String',
      name: 'businessName'
    },
    {
      class: 'String',
      name: 'displayName',
      expression: function(firstName, lastName, businessName, userClass) {
        var name = businessName.trim();
        if ( ! name ) {
          name = this.fullName.trim();
        }
        return name;
      }
    },
    {
      class: 'String',
      name: 'userClass'
    },
    {
      class: 'EMail',
      name: 'email'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView' }
    }
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public TransactionEntity(User user) {
            setId(user.getId());
            setFirstName(user.getFirstName());
            setLastName(user.getLastName());
            setEmail(user.getEmail());
            setUserClass(user.getClass().getName());
            setBusinessName(user.getBusinessName());
            setProfilePicture(user.getProfilePicture());
          }
        `);
      }
    }
  ]
});
