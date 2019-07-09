/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'CSVSink',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink runs the csv outputter, and contains the resulting string in this.csv',

  javaImports: [
    'foam.core.*',
    'java.util.List',
    'java.lang.String',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'String',
      name: 'csv',
      view: 'foam.u2.tag.TextArea'
    },
    {
      class: 'Class',
      name: 'of',
      visibility: 'HIDDEN'
    },
    {
      class: 'StringArray',
      name: 'props',
      factory: function() {
        return this.of.getAxiomByName('tableColumns').columns;
      },
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'isHeadersOutput',
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'isFirstRow',
      value: true,
      visibility: 'HIDDEN'
    },
    {
      class: 'Object',
      name: 'sb',
      flags: ['java'],
      javaType: 'java.lang.StringBuilder',
      javaFactory: 'return new StringBuilder();',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'output',
      args: [
        { name: 'value' }
      ],
      code: function(value) {
        if ( ! this.isFirstRow ) this.csv += ',';
        this.isFirstRow = false;
        this.output_(value);
      },
      javaCode: `
        if ( ! getIsFirstRow() ) getSb().append(",");
        setIsFirstRow(false);
        output_(value);
      `
    },
    {
      name: 'output_',
      args: [
        { type: 'Any', name: 'value' }
      ],
      code:
        foam.mmethod(
          {
            String: function(value) {
              this.csv += `"${value.replace(/\"/g, '""')}"`;
            },
            Number: function(value) {
              this.csv += value.toString();
            },
            Boolean: function(value) {
              this.csv += value.toString();
            },
            Date: function(value) {
              this.output_(value.toDateString());
            },
            FObject: function(value) {
              this.output_(foam.json.Pretty.stringify(value));
            },
            Array: function(value) {
              this.output_(foam.json.Pretty.stringify(value));
            },
            Undefined: function(value) {},
            Null: function(value) {}
          }, function(value) {
            this.output_(value.toString());
        }),
      javaCode: `
        if ( value instanceof String ) {
          getSb().append("\\"");
          getSb().append(((String)value).replace("\\"", "\\"\\""));
          getSb().append("\\"");
        } else if ( value instanceof Number ) {
          getSb().append(value.toString());
        } else if ( value instanceof Boolean ) {
          getSb().append(value.toString());
        } else if ( value instanceof Date ) {
          getSb().append(value.toString());
        } else if ( value instanceof FObject ) {
          output_(value.toString());
        } else if ( value instanceof List ) {
          output_(value.toString());
        } else {
          getSb().append(value.toString());
        }
      `
    },
    {
      name: 'newLine_',
      code: function() {
        this.csv += '\n';
        this.isFirstRow = true;
      },
      javaCode: `
        getSb().append("\\n");
        setIsFirstRow(true);
      `
    },
    {
      name: 'eof',
      javaCode: 'setCsv(getSb().toString());'
    },
    {
      name: 'put',
      code: function(obj) {
        if ( ! this.of ) this.of = obj.cls_;
        var element = undefined;
        if ( ! this.isHeadersOutput ) {
          this.props.forEach((name) => {
            element = this.of.getAxiomByName(name);
            element.toCSVLabel(this, element);
          });
          this.newLine_();
          this.isHeadersOutput = true;
        }

        this.props.forEach((name) => {
          element = this.of.getAxiomByName(name);
          element.toCSV(x, obj, this, element);
        });
        this.newLine_();
      },
      javaCode: `
        if ( ! isPropertySet("of") ) setOf(((foam.core.FObject)obj).getClassInfo());

        Object propObj;
        PropertyInfo columnProp;
        String[] tableColumnNames = getProps();

        if ( ! getIsHeadersOutput() ) {
          for (String propName: tableColumnNames) {
            propObj = ((foam.core.FObject)obj).getProperty(propName);
            columnProp = (PropertyInfo) getOf().getAxiomByName(propName);
            columnProp.toCSVLabel(this, propObj);
          }
          newLine_();
          setIsHeadersOutput(true);
        }

        for (String propName : tableColumnNames) {
          propObj = ((foam.core.FObject)obj).getProperty(propName);
          columnProp = (PropertyInfo) getOf().getAxiomByName(propName);
          columnProp.toCSV(getX(), obj, this, propObj);
        }
        newLine_();
      `
    },
    {
      name: 'reset',
      code: function() {
        ['csv', 'isFirstRow', 'isHeadersOutput']
          .forEach( (s) => this.clearProperty(s) );
      },
      javaCode: `
        getSb().setLength(0);
        clearCsv();
        clearIsFirstRow();
        clearIsHeadersOutput();
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'PropertyCSVRefinement',

  documentation: `Refinement on Properties to handle toCSV() and toCSVLabel().`,

  refines: 'foam.core.Property',

  properties: [
    {
      name: 'toCSV',
      class: 'Function',
      value: function(obj, outputter, prop) {
        outputter.output(obj ? obj[prop.name] : null);
      }
    },
    {
      name: 'toCSVLabel',
      class: 'Function',
      value: function(outputter, prop) {
        outputter.output(prop.name);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'FObjectPropertyCSVRefinement',

  documentation: `Refinement on FObjects to override toCSV() and toCSVLabel().
  Purpose is to output a dot annotated format, to handle the nested properties on the FObject.`,

  refines: 'foam.core.FObjectProperty',

  properties: [
    {
      name: 'toCSV',
      class: 'Function',
      value: function(x, obj, outputter, prop) {
        if ( ! prop.of ) {
          outputter.output(obj ? obj[prop.name] : null);
          return;
        }
        prop.of.getAxiomsByClass(foam.core.Property)
          .forEach((axiom) => {
            axiom.toCSV(x, obj ? obj[prop.name] : null, outputter, axiom);
          });
      }
    },
    {
      name: 'toCSVLabel',
      class: 'Function',
      value: function(outputter, prop) {
        if ( ! prop.of ) {
          outputter.output(prop.name);
          return;
        }
        // mini decorator
        var prefixedOutputter = {
          output: function(value) {
            outputter.output(prop.name + '.' + value);
          }
        };
        prop.of.getAxiomsByClass(foam.core.Property)
          .forEach((axiom) => {
            axiom.toCSVLabel(prefixedOutputter, axiom);
          });
      }
    }
  ]
});
