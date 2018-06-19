global.FOAM_FLAGS.src = __dirname + '/../src/';
require('../src/net/nanopay/files.js');

var classes = [
  'net.nanopay.auth.sms.AuthyTokenService',
  'net.nanopay.cico.model.ServiceProvider',
  'net.nanopay.cico.model.TransactionType',
  'net.nanopay.cico.model.EFTReturnRecord',
  'net.nanopay.cico.model.EFTConfirmationFileRecord',
  'net.nanopay.cico.model.EFTReturnFileCredentials',
  'net.nanopay.cico.spi.alterna.AlternaFormat',
  'net.nanopay.cico.spi.alterna.SFTPService',
  'net.nanopay.cico.spi.alterna.AlternaSFTPService',
  'net.nanopay.cico.spi.alterna.client.ClientAlternaSFTPService',
  'net.nanopay.cico.service.BankAccountVerifier',
  'net.nanopay.cico.service.ClientBankAccountVerifierService',
  'net.nanopay.cico.paymentCard.model.PaymentCard',
  'net.nanopay.cico.paymentCard.model.PaymentCardType',
  'net.nanopay.cico.paymentCard.model.PaymentCardNetwork',
  'net.nanopay.cico.paymentCard.model.PaymentCardPaymentPlatform',
  'net.nanopay.model.Account',
  'net.nanopay.model.Branch',
  'net.nanopay.model.BankAccount',
  'net.nanopay.model.BankAccountStatus',
  'net.nanopay.model.Broker',
  'net.nanopay.model.BusinessSector',
  'net.nanopay.model.BusinessType',
  'net.nanopay.model.Currency',
  'net.nanopay.model.PadAccount',
  'net.nanopay.model.PadCapture',
  'net.nanopay.model.Identification',
  'net.nanopay.model.DateAndPlaceOfBirth',
  'net.nanopay.liquidity.model.Threshold',
  'net.nanopay.liquidity.model.ThresholdResolve',
  'net.nanopay.liquidity.model.BalanceAlert',
  'net.nanopay.liquidity.model.Liquidity',

  // invite
  'net.nanopay.admin.model.ComplianceStatus',
  'net.nanopay.admin.model.AccountStatus',
  'net.nanopay.onboarding.model.Question',
  'net.nanopay.onboarding.model.Questionnaire',
  'net.nanopay.onboarding.InvitationTokenService',
  'net.nanopay.onboarding.FirebaseInvitationTokenService',

  // invoice
  'net.nanopay.invoice.model.PaymentStatus',
  'net.nanopay.invoice.model.RecurringInvoice',
  'net.nanopay.invoice.model.Invoice',
  'net.nanopay.fresh.FreshConfig',
  'net.nanopay.fresh.model.FreshToken',
  'net.nanopay.fresh.model.FreshBusiness',
  'net.nanopay.fresh.model.FreshBusinessMembership',
  'net.nanopay.fresh.model.FreshCurrent',
  'net.nanopay.fresh.model.FreshResponse',
  'net.nanopay.fresh.model.FreshInvoiceResponse',
  'net.nanopay.fresh.model.FreshInvoiceResult',
  'net.nanopay.fresh.model.FreshInvoicePages',
  'net.nanopay.fresh.model.FreshInvoice',
  'net.nanopay.fresh.model.FreshInvoiceAmount',
  'net.nanopay.invoice.xero.TokenStorage',

  // fx
  'net.nanopay.fx.ExchangeRateInterface',
  'net.nanopay.fx.client.ClientExchangeRateService',
  'net.nanopay.fx.interac.model.PayoutOptions',
  'net.nanopay.fx.interac.model.Corridor',
  'net.nanopay.fx.interac.model.RequiredUserFields',
  'net.nanopay.fx.interac.model.RequiredAddressFields',
  'net.nanopay.fx.interac.model.RequiredIdentificationFields',
  'net.nanopay.fx.interac.model.RequiredAccountFields',
  'net.nanopay.fx.interac.model.RequiredAgentFields',
  'net.nanopay.fx.interac.model.RequiredDocumentFields',
  'net.nanopay.fx.model.ExchangeRate',
  'net.nanopay.fx.model.ExchangeRateQuote',
  'net.nanopay.tx.UserTransactionLimit',
  'net.nanopay.tx.client.ClientUserTransactionLimitService',
  'net.nanopay.retail.model.DeviceType',
  'net.nanopay.tx.model.CashOutFrequency',
  'net.nanopay.tx.model.Fee',
  'net.nanopay.tx.model.FeeInterface',
  'net.nanopay.tx.model.FeeType',
  'net.nanopay.tx.model.FixedFee',
  'net.nanopay.tx.model.InformationalFee',
  'net.nanopay.tx.model.LiquiditySettings',
  'net.nanopay.tx.model.LiquidityAuth',
  'net.nanopay.tx.model.PercentageFee',
  'net.nanopay.tx.model.TransactionStatus',
  'net.nanopay.tx.model.TransactionEntity',
  'net.nanopay.tx.model.Transaction',
  'net.nanopay.tx.model.TransactionLimit',
  'net.nanopay.tx.model.TransactionLimitTimeFrame',
  'net.nanopay.tx.model.TransactionLimitType',
  'net.nanopay.tx.model.TransactionPurpose',
  'net.nanopay.retail.model.DeviceStatus',
  'net.nanopay.retail.model.Device',
  'net.nanopay.s2h.model.S2HInvoice',
  // Institution model
  'net.nanopay.model.Institution',
  'net.nanopay.fx.ascendantfx.AscendantFX',
  'net.nanopay.fx.lianlianpay.LianLianPay',
  'net.nanopay.fx.lianlianpay.model.ResultCode',
  'net.nanopay.fx.lianlianpay.model.DistributionMode',
  'net.nanopay.fx.lianlianpay.model.InstructionType',
  'net.nanopay.fx.lianlianpay.model.CurrencyBalanceRecord',
  'net.nanopay.fx.lianlianpay.model.InstructionCombined',
  'net.nanopay.fx.lianlianpay.model.InstructionCombinedRequest',
  'net.nanopay.fx.lianlianpay.model.InstructionCombinedSummary',
  'net.nanopay.fx.lianlianpay.model.PreProcessResult',
  'net.nanopay.fx.lianlianpay.model.PreProcessResultResponse',
  'net.nanopay.fx.lianlianpay.model.PreProcessResultSummary',
  'net.nanopay.fx.lianlianpay.model.Reconciliation',
  'net.nanopay.fx.lianlianpay.model.ReconciliationRecord',
  'net.nanopay.fx.lianlianpay.model.Statement',
  'net.nanopay.fx.lianlianpay.model.StatementRecord',
  'foam.nanos.auth.UserUserJunction',
  'net.nanopay.fx.interac.model.ExchangerateApiModel',
  'net.nanopay.fx.interac.model.AcceptRateApiModel',
  'net.nanopay.fx.interac.model.AcceptExchangeRateFields',

  // PaymentAccountInfo
  'net.nanopay.cico.model.PaymentAccountInfo',
  'net.nanopay.cico.model.RealexPaymentAccountInfo',
  'net.nanopay.cico.model.MobileWallet',
  'net.nanopay.cico.model.PaymentType',
  'net.nanopay.cico.model.PaymentProcessorUserReference',
  'net.nanopay.cico.model.PaymentProcessor',

  // security
  'net.nanopay.security.EncryptedObject',
  'net.nanopay.security.KeyStoreManager',
  'net.nanopay.security.FileKeyStoreManager',
  'net.nanopay.security.HashedFObject',
  'net.nanopay.security.HashingJournal',
  'net.nanopay.security.csp.CSPViolation',
  'net.nanopay.security.csp.CSPReportWebAgent',
  
  //topnavigation
  'net.nanopay.ui.topNavigation.CurrencyChoiceView'

];

var abstractClasses = [
  'net.nanopay.invoice.xero.AbstractXeroService'
];

var skeletons = [
  'net.nanopay.cico.service.BankAccountVerifier',
  'net.nanopay.cico.spi.alterna.SFTPService',
  'net.nanopay.fx.ExchangeRateInterface',
  'net.nanopay.tx.UserTransactionLimit',
  'net.nanopay.tx.model.LiquidityAuth'
];

var proxies = [
  'net.nanopay.cico.service.BankAccountVerifier'
];

module.exports = {
    classes: classes,
    abstractClasses: abstractClasses,
    skeletons: skeletons,
    proxies: proxies
};
