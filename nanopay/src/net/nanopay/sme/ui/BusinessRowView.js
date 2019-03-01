foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessRowView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
     A single row in a list of businesses.
     It needs to pass in the businessId as data
  `,

  imports: [
    'businessDAO',
    'user'
  ],

  requires: [
    'net.nanopay.auth.AgentJunctionStatus',
    'net.nanopay.model.Business'
  ],

    css: `
      ^ {
        background: white;
        background-color: #ffffff;
        border: solid 1px #e2e2e3;
        border-radius: 3px;
        box-shadow: 0 1px 1px 0 #dae1e9;
        box-sizing: border-box;
        height: 64px;
        margin-bottom: 8px;
        padding: 0 24px;
      }
      ^:hover {
        cursor: pointer;
      }
      ^:hover ^select-icon {
        background: url(images/ablii/selectcompanyarrow-active.svg);
      }
      ^row {
        align-items: center;
        display: flex;
        justify-content: space-between;
      }
      ^business-name {
        font-size: 16px;
        font-weight: 800;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.5;
        letter-spacing: normal;
        color: %PRIMARYCOLOR%;
      }
      ^business-location {
        font-size: 10px;
        line-height: 1.5;
        color: #8e9090
      }
      ^select-icon {
        background: url(images/ablii/selectcompanyarrow-resting.svg);
        height: 32px;
        width: 32px;
      }
      ^status {
        color: #f91c1c;
        margin-right: 27px;
        font-size: 11px;
      }
      ^status-dot {
        background-color: #f91c1c;
        margin-right: 6px;
        height: 4px;
        width: 4px;
        border-radius: 999px;
        margin-top: 1px;
      }
    `,

    messages: [
      { name: 'DISABLED', message: 'Disabled' }
    ],

    properties: [
      {
        class: 'FObjectProperty',
        name: 'data',
        documentation: 'Set this to the business you want to display in this row.'
      },
      {
        class: 'FObjectProperty',
        of: 'net.nanopay.model.Business',
        name: 'business'
      }
    ],

    methods: [
      function init() {
        this.businessDAO
          .find(this.data.id).then((business) => {
            this.business = business;
          });
      },

      function initE() {
        this.start()
          .addClass(this.myClass())
          .addClass(this.myClass('row'))
          .start()
            .start()
              .addClass(this.myClass('business-name'))
              .add(this.slot(function(business) {
                return business ? business.organization : '';
              }))
            .end()
            .start()
              .addClass(this.myClass('business-location'))
              .add(this.slot(function(business) {
                if ( business ) {
                  var region = business.businessAddress.regionId;
                  var country = business.businessAddress.countryId;
                  if ( region && country ) {
                    return `${region}, ${country}`;
                  } else if ( region ) {
                    return region;
                  } else if ( country ) {
                    return country;
                  } else {
                    return '';
                  }
                }
              }))
            .end()
          .end()
          .start()
            .addClass(this.myClass('row'))
            .start()
              .addClass(this.myClass('select-icon'))
            .end()
          .end()
        .end();
      }
    ]
  });
