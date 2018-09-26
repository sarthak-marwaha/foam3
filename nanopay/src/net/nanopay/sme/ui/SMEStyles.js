foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SMEStyles',
  extends: 'foam.u2.View',

  documentation: 'SME CSS that is used through out',

  css: `
    .content-form {
      margin-top: 25%;
      margin-right: 10%;
      margin-left: 10%;
    }
    .sme-title {
      height: 30px;
      font-size: 20px;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093649;
    }
    .sme-subTitle {
      font-size: 14px;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093400;
      font-weight: 300;
      margin-bottom: 15px;
    }
    .sme-labels {
      font-size: 14px;
      color: #093649;
      font-family: Roboto;
      margin-bottom: 1px;
    }
    .sme-inputContainer {
      margin-top: 1%;
    }
    .sme-nameRowL {
      display: inline-block;
      width: calc((100% - 2%) / 2);
    }
    .sme-nameRowR {
      display: inline-block;
      width: calc((100% - 2%) / 2);
      margin-left: 2%;
    }
    .sme-nameFields {
      background-color: #eeeeee;
      height: 40px;
      width: 100%;
      font-size: 14px;
    }
    .sme-dataFields {
      background-color: #eeeeee;
      height: 40px;
      width: 100%;
      font-size: 14px;
    }
    .sme-link {
      margin-left: 5px;
      color: #7404EA;
      cursor: pointer;
    }
    .sme-button {
      position: relative;
      width: 100% !important;
      height: 40px;
      background-color: #7404ea;
      font-size: 14px;
      border: none;
      color: white;
      border-radius: 2px;
      outline: none;
      cursor: pointer;
      filter: grayscale(0%);
      margin-top: 15px;
      margin-bottom: 15px;
    }
    .net-nanopay-ui-ActionView-createNew:hover {
      background-color: #9447e5;
    }
    .sme-property-password {
      -webkit-text-security: disc;
      -moz-text-security: disc;
      text-security: disc;
      background-color: #eeeeee;
      height: 40px;
      width: 100%;
      font-size: 14px;
    }
    .sme-image {
      display: inline-block;
      height: 100%;
      width: 100%;
      float: right;
    }
    .sme-text-block {
      top: 20%;
      left: 25%;
      position: absolute;
    }
    .input-field {
      padding-right: 30px;
      width: 100%;
      font-size: 14px;
      height: 40px;
    }
    .input-image {
      position: absolute;
      width: 24px;
      height: 24px;
      bottom: 8px;
      right: 6px;
    }
    .forgot-link {
      margin-left: 0px;
      color: #7404EA;
      cursor: pointer;
    }
    .img-replacement {
      background: -webkit-radial-gradient(pink, cyan);
      width: 100%;
      height: 100%;
    }
  `
});
