/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.column',
  name: 'CSVTableOutputter',
  extends: 'foam.nanos.column.TableColumnOutputter',

  documentation: 'Outputter to output array of values to CSV',

  methods: [
    function arrayToCSV(arrayOfValues) {
      var output = [];
      for ( var row of arrayOfValues ) {
        row = row.map(v =>  {
          return '"' + (v.replaceAll && v.replaceAll('"', '""') || v) +  '"' ;
        });
        output.push(row.join(','));
      }
      return output.join('\n');
    }
  ]
});
