global.FOAM_FLAGS.src = __dirname + '/../nanopay/src/';
require(__dirname + '/../nanopay/src/net/nanopay/files.js');

var classes = [
  'MintChipClient',
  'TransactionRow',
  'TransactionRowIBView',
  'foam.swift.ui.FOAMUILabel',
  'foam.swift.ui.DAOTableViewSource',

  'foam.blob.Blob',
  'foam.box.Box',
  'foam.box.LogBox',
  'foam.box.BoxRegistry',
  'foam.box.BoxService',
  'foam.box.ClientBoxRegistry',
  'foam.box.Context',
  'foam.box.HTTPBox',
  'foam.box.Message',
  'foam.box.ProxyBox',
  'foam.box.RPCMessage',
  'foam.box.RemoteException',
  'foam.box.ReplyBox',
  'foam.box.SessionClientBox',
  'foam.box.swift.FileBox',
  'foam.log.LogLevel',
  'foam.dao.ArraySink',
  'foam.dao.ClientDAO',
  'foam.dao.ManyToManyRelationship',
  'foam.mlang.Constant',
  'foam.mlang.Expr',
  'foam.mlang.predicate.Eq',
  'foam.mlang.sink.Count',
  'foam.nanos.auth.Address',
  'foam.nanos.auth.Hours',
  'foam.nanos.auth.DayOfWeek',
  'foam.nanos.auth.AuthService',
  'foam.nanos.auth.ClientAuthService',
  'foam.nanos.auth.Country',
  'foam.nanos.auth.EnabledAware',
  'foam.nanos.auth.Language',
  'foam.nanos.auth.LastModifiedAware',
  'foam.nanos.auth.LastModifiedByAware',
  'foam.nanos.auth.Phone',
  'foam.nanos.auth.Region',
  'foam.nanos.auth.User',
  'foam.nanos.auth.token.ClientTokenService',
  'foam.nanos.auth.token.Token',
  'foam.nanos.auth.token.TokenService',
  'foam.nanos.auth.resetPassword.ResetPasswordTokenService',
  'foam.nanos.fs.File',
  'foam.swift.box.RPCReturnBox',
  'foam.swift.parse.StringPStream',
  'foam.swift.parse.json.output.Outputter',
  'foam.swift.ui.DAOTableViewSource',
  'foam.swift.ui.DetailView',
  'foam.u2.Visibility',
  'foam.nanos.auth.email.EmailTokenService',
  'net.nanopay.auth.sms.AuthyTokenService',
  'net.nanopay.admin.model.AccountStatus',
  'net.nanopay.admin.model.ComplianceStatus',
  'net.nanopay.model.Account',
  'net.nanopay.model.BankAccount',
  'net.nanopay.onboarding.model.Questionnaire',
  'net.nanopay.onboarding.model.Question',
  'net.nanopay.tx.UserTransactionLimit',
  'net.nanopay.tx.client.ClientUserTransactionLimitService',
  'net.nanopay.tx.model.Fee',
  'net.nanopay.tx.model.FeeInterface',
  'net.nanopay.tx.model.FeeType',
  'net.nanopay.tx.model.FixedFee',
  'net.nanopay.tx.model.InformationalFee',
  'net.nanopay.tx.model.PercentageFee',
  'net.nanopay.tx.model.Transaction',
  'net.nanopay.tx.model.TransactionLimit',
  'net.nanopay.tx.model.TransactionLimitTimeFrame',
  'net.nanopay.tx.model.TransactionLimitType',
  'net.nanopay.tx.model.TransactionPurpose',
  'net.nanopay.tx.model.TransactionStatus',
  'net.nanopay.cico.model.TransactionType',
  'net.nanopay.invoice.model.Invoice',
  'net.nanopay.invoice.model.PaymentStatus'
];

module.exports = {
  classes: classes,
}
