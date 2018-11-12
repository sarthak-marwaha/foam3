foam.INTERFACE({
  package: 'net.nanopay.sme.passwordutil',
  name: 'PasswordEntropy',

  methods: [
    {
      name: 'getPasswordStrength',
      args: [
        {
          name: 'password',
          class: 'String'
        }
      ],
      returns: 'Promise',
      javaReturns: 'int'
    }
  ]
});
