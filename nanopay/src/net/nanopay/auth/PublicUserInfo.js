foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'PublicUserInfo',
  documentation: `This model represents a public subset of a user's properties`,

  javaImports: ['foam.nanos.auth.User'],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'firstName',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'lastName',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'businessName',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'EMail',
      name: 'email'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView' }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'businessAddress',
      view: { class: 'foam.nanos.auth.AddressDetailView' },
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'businessPhone',
      view: { class: 'foam.nanos.auth.PhoneDetailView' },
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'businessProfilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView' },
      visibility: foam.u2.Visibility.RO
    },
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PublicUserInfo(User user) {
            setId(user.getId());
            setFirstName(user.getFirstName());
            setLastName(user.getLastName());
            setBusinessName(user.getBusinessName());
            setEmail(user.getEmail());
            setProfilePicture(user.getProfilePicture());
            setBusinessProfilePicture(user.getBusinessProfilePicture());
            setBusinessAddress(user.getBusinessAddress());
            setBusinessPhone(user.getBusinessPhone());
          }
        `);
      },
    },
  ],
});
