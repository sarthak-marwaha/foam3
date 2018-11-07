/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RichChoiceView',
  extends: 'foam.u2.View',

  documentation: `
    This is similar to foam.u2.view.ChoiceView, but lets you provide views for
    the button content and options instead of strings. This allows you to create
    dropdowns with rich content like images and formatting using CSS.

    Example usage for a Reference property on a model:

      {
        class: 'Reference',
        of: 'foam.nanos.auth.User',
        name: 'exampleProperty',
        view: function(_, X) {
          return {
            class: 'foam.u2.view.RichChoiceView',
            buttonContentView: { class: 'a.b.c.MyCustomButtonView' }, // Optional
            rowView: { class: 'a.b.c.MyCustomCitationView' }, // Optional
            sections: [
              {
                heading: 'Users',
                dao: X.userDAO.orderBy(foam.nanos.auth.User.LEGAL_NAME)
              }
            ]
          };
        }
      }
  `,

  exports: [
    'of'
  ],

  css: `
    ^ {
      position: relative;
    }

    ^container {
      position: absolute;
      top: 40px; // 36px for height of button, plus 4px bottom margin
      left: 0;
      background: white;
      border: 1px solid #bdbdbd;
      border-radius: 4px;
      width: 488px;
      max-height: 378px;
      overflow-y: scroll;
      box-sizing: border-box;
    }

    ^heading {
      font-weight: bold;
      border-bottom: 1px solid #f4f4f9;
      line-height: 24px;
      font-size: 14px;
      color: #333;
      font-weight: 900;
      padding: 6px 16px;
    }

    ^button {
      height: 36px;
      width: 488px;
      border-radius: 4px;
      border: solid 1px #bdbdbd;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      font-size: 12px;
      box-sizing: border-box;
      margin-bottom: 4px;
    }

    ^chevron::before {
      content: '▾';
      color: #bdbdbd;
      font-size: 17px;
      padding-left: 8px;
    }

    ^custom-button {
      flex-grow: 1;
    }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'rowView',
      documentation: `
        Set this to override the default view used for each row. It will be
        instantiated with an object from the DAO as the 'data' property.
      `,
      factory: function() {
        return this.DefaultRowView;
      }
    },
    {
      name: 'data',
      documentation: `
        The value that gets chosen. This is set whenever a user makes a choice.
      `
    },
    {
      class: 'Boolean',
      name: 'isOpen_',
      documentation: `
        An internal property used to determine whether the options list is
        visible or not.
      `
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'buttonContentView',
      documentation: `
        Set this to override the default view used for the button content. It
        will be instantiated with an object from the DAO as the 'fullObject'
        property and that object's id as the 'data' property.
      `,
      factory: function() {
        return this.DefaultButtonContentView;
      }
    },
    {
      class: 'Array',
      name: 'sections',
      documentation: `
        This lets you pass different predicated versions of a dao in different
        sections, which can be used to do things like grouping by some property
        for each section.
        Each object in the array must have a 'label' property of type string
        which will be used for the section heading, and a 'dao' property of type
        DAO that will be used to populate the list in that section.
      `,
    },
    {
      class: 'FObjectProperty',
      name: 'of',
      documentation: 'The model stored in the DAO. Used intenrally.',
      expression: function(sections) {
        return sections[0].dao.of;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'fullObject_',
      documentation: `
        The full object from the DAO. This property is only used internally, you
        do not need to set it as a consumer of this view.
      `
    }
  ],

  methods: [
    function initE() {
      var self = this;

      if ( ! Array.isArray(this.sections) || this.sections.length === 0 ) {
        throw new Error(`You must provide an array of sections. See documentation on the 'sections' property in RichTextView.js.`);
      }

      // If the property that this view is for already has a value when being
      // rendered, the 'data' property on this model will be set to an id for
      // the object being referenced by the Reference property being rendered.
      // Custom views might need the full object to render though, not just the
      // id, so we do a lookup at the beginning of initE for the full object and
      // set it here when found. This then gets passed to the button view to use
      // it if it wants to.
      if ( this.data ) {
        this.sections[0].dao.find(this.data).then((result) => {
          this.fullObject_ = result;
        });
      }

      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('button'))
          .on('click', function() {
            self.isOpen_ = ! self.isOpen_;
          })
          .start()
            .addClass(this.myClass('custom-button'))
            .add(this.slot((data) => {
              return this.E().tag(self.buttonContentView, {
                data: data,
                fullObject$: this.fullObject_$
              });
            }))
          .end()
          .start()
            .addClass(this.myClass('chevron'))
          .end()
        .end()
        .start()
          .addClass(this.myClass('container'))
          .show(self.isOpen_$)
          .forEach(this.sections, function(section) {
            var dao = section.dao;
            this
              .start()
                .addClass(self.myClass('heading'))
                .add(section.heading)
              .end()
              .start()
                .select(dao, function(obj) {
                  return this.E()
                    .start(self.rowView, { data: obj })
                      .on('click', () => {
                        self.fullObject_ = obj;
                        self.data = obj;
                        self.isOpen_ = false;
                      })
                    .end();
                })
              .end();
          })
        .end();
    }
  ],

  classes: [
    {
      name: 'DefaultRowView',
      extends: 'foam.u2.View',

      documentation: `
        This is the view that gets rendered for each item in the list.
      `,

      css: `
        ^row {
          background: white;
          padding: 8px 16px;
        }

        ^row:hover {
          background: #f4f4f9;
          cursor: pointer;
        }
      `,

      properties: [
        {
          name: 'data',
          documentation: 'The selected object.'
        }
      ],

      methods: [
        function initE() {
          return this
            .start()
              .addClass(this.myClass('row'))
              .add(this.data.id)
            .end();
        }
      ]
    },
    {
      name: 'DefaultButtonContentView',
      extends: 'foam.u2.Element',

      documentation: `
        This is the view that gets rendered inside the button. It is put to the
        left of the chevron (the triangle at the far right side of the button).
        This is an Element instead of a simple string, meaning the button can
        contain "rich" content like images and make use of CSS for styling and
        layout.
        As an example of why this is useful, imagine you wanted to show a
        dropdown to select a country. You could choose to display the flag of
        the selected country alongside its name after the user makes a
        selection by creating that custom view and providing it in place of this
        one by setting the buttonContentView property on RichChoiceView.
      `,

      imports: [
        'of'
      ],

      messages: [
        {
          name: 'CHOOSE_FROM',
          message: 'Choose from '
        }
      ],

      properties: [
        {
          name: 'data',
          documentation: 'The id of the selected object.'
        },
        {
          name: 'fullObject',
          documentation: `
            The full object. It's not used here in the default button view, but
            this property is included to let you know that if you create a
            custom button content view, it will be passed the id of the object
            (data) as well as the full object.
          `
        }
      ],

      methods: [
        function initE() {
          var plural = this.of.model_.plural.toLowerCase();
          return this.add(this.data || this.CHOOSE_FROM + plural);
        }
      ]
    }
  ]
});
