/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.gitlog',
  name: 'UserMonthView',
  extends: 'foam.u2.View',

  css: `
    ^ table { font-size: smaller; }
    ^ th { text-align: right; }
    ^ th:first-child { text-align: left; }
    ^ td { align: rigth; }
    ^ .selected { color: red; }
  `,

  methods: [
    function render() {
      var self         = this;
      var commits      = this.data.commits;
      var counts       = [0,0,0,0,0,0,0,0,0,0,0,0];
      var authorCounts = {};

      commits.forEach(c => {
        var month   = c.date.getMonth();
        var author  = c.author;
        var aCounts = authorCounts[author] || ( authorCounts[author] = [0,0,0,0,0,0,0,0,0,0,0,0] );
        counts[month]++;
        aCounts[month]++;
      });

      this.addClass(this.myClass()).start('table')
        .attrs({cellpadding: 4, cellspacing: 0, border: 1}).
        start('tr').
          start('th').add('Author').end().
          start('th').add('Jan').end().
          start('th').add('Feb').end().
          start('th').add('Mar').end().
          start('th').add('Apr').end().
          start('th').add('May').end().
          start('th').add('Jun').end().
          start('th').add('July').end().
          start('th').add('Aug').end().
          start('th').add('Sept').end().
          start('th').add('Oct').end().
          start('th').add('Nov').end().
          start('th').add('Dec').end().
          start('th').add('').end().
        end().
        forEach(this.data.authors, function(a) {
          var total = 0;
          if ( ! authorCounts[a[0]] ) return;
          this.start('tr').
            enableClass('selected', self.data.author$.map(auth => auth == a[0])).
            start('th').
              start('href').on('click', () => self.data.author = a[0]).add(a[0]).end().
            end().
            forEach(authorCounts[a[0]], function(c) {
              total += c;
              this.start('td').add(c || '-').end();
            }).
            start('th').add(total).end().
          end();
        }).
        start('tr').
          start('th').on('click', () => self.data.author = '-- All --').add('All:').end().
          forEach(counts, function(c) {
            this.start('th').add(c).end();
          }).
          start('th').add(this.data.commits.length).end().
        end().
      end();
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.gitlog',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.demos.gitlog.UserMonthView'
  ],

  exports: [
  ],

  css: `
    tr:hover { background: lightskyblue; }
  `,

  constants: {
    IGNORE_CONTAINS: [
      'merge',
      'Revert',
      'fix syntax error',
      'Cleanup',
      "Small fix",
      'Add test',
      'broken build',
      'fix build',
      'Fix build',
      'typo',
      'Fix spacing',
      'Merge release',
      'Release-',
      'revert'
    ],
    IGNORE_EQUALS: [
      'Updated.',
      'Formatting',
      'Formatting.',
      'Cleanup',
      'cleanup',
      'remove extra space',
      'Add comment.',
      'Spacing.',
      'Sort exports.',
      'Fix indentation.',
      'fixing pr',
      'syntax error',
      'format',
      'Remove unused code.',
      'Indentation.'
    ],
    AUTHOR_MAP: {
      'Adam Fox': 'Adam Fox',
      'Arthur Pavlovs': 'Arthur Pavlovs',
      'Blake Green': 'Blake Green',
      'Carl Chen': 'Carl Chen',
      'Chanmann Lim': 'Chanmann Lim',
      'Christine Lee': 'Christine Lee',
      'Danny Tharma': 'Danny Tharma',
      'Jin Jung': 'Jin Jung',
      'Joel Hughes': 'Joel Hughes',
      'Kenny Qi Yen Kan': 'Kenny Qi Yen Kan',
      'Kristina Smirnova': 'Kristina Smirnova',
      'Mayowa Olurin': 'Mayowa Olurin',
      'Mykola Kolombet': 'Mykola Kolombet',
      'Nick Prat': 'Nick Prat',
      'Olha Bahatiuk': 'Olha Bahatiuk',
      'Patrick Zanowski': 'Patrick Zanowski',
      'Scott Head': 'Scott Head',
      "Kevin Greer": "Kevin Greer",

      'Anna': 'Anna Doulatshahi',
      'blakegreen': 'Blake Green',
      'carl-zzz': 'Carl Chen',
      'Christine': 'Christine Lee',
      'Eric DubÃ©': 'Eric Dube',
      'Eric': 'Eric Dube',
      'garfield jian': 'Garfiled Jian',
      'hchoura': 'Hassene Choura',
      'Jin': 'Jin Jung',
      'JIn': 'Jin Jung',
      'jinn9': 'Jin Jung',
      'kristina': 'Kristina Smirnova',
      'mcarcaso': 'Mike Carcasole',
      'Michal': 'Michal Pasternak',
      'microArtur': 'Artur Linnik',
      'MINSUN KIM': 'Minsun Kim',
      'Minsun': 'Minsun Kim',
      'Mykola97': 'Mykola Kolombet',
      'nanoArtur': 'Artur Linnik',
      'nanokristina': 'Kristina Smirnova',
      'nanoMichal': 'Michal Pasternak',
      'nanoNeel': 'Neel Patel',
      'Nauna': 'Anna Doulatshahi',
      'Neelkanth Patel': 'Neel Patel',
      'Nicholas Prat': 'Nick Prat',
      'noodlemoodle': 'Ruby Zhang',
      'RachaelDing': 'Rachael Ding',
      'Ruby': 'Ruby Zhang',
      'sarthak-marwaha': 'Sarthak Marwaha',
      'sarthak': 'Sarthak Marwaha',
      'tala': 'Tala Abu Adas',
      'Tala': 'Tala Abu Adas',
      'xuerongNanopay': 'Xuerong Wu',
      'yij793': 'Garfiled Jian',
      "Kevin Glen Roy Greer": "Kevin Greer",
      "nanopay-arthur": 'Arthur Pavlovs',
      "olhabn": 'Olha Bahatiuk',
    },
    PROJECT_RULES: [
      {
        name: 'Hybrid-Blockchain',
        keywords: [ 'medusa', 'mdao' ]
      }
    ]
  },
  properties: [
    {
      class: 'Boolean',
      name: 'showFiles'
    },
    {
      class: 'Array',
      name: 'authors',
      factory: function() {
        var authors = { '-- All --': this.commits.length };
        this.commits.forEach(c => this.incr(authors, c.author));
        return Object.keys(authors).sort().map(a => [a, a + ' ' + authors[a]]);
      }
    },
    {
      class: 'String',
      name: 'author',
      value: '-- All --',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({choices: X.data.authors}, X);
      }
    },
    {
      class: 'Array',
      name: 'projects',
      factory: function() {
        var projects = { '-- All --': this.commits.length };
        this.commits.forEach(c => this.incr(projects, c.project || '-- Unknown --'));
        return Object.keys(projects).sort().map(a => [a, a + ' ' + projects[a]]);
      }
    },
    {
      class: 'String',
      name: 'project',
      value: '-- All --',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({choices: X.data.projects}, X);
      }
    },
    {
      class: 'Array',
      name: 'files',
      factory: function() {
        var files = { '/': this.commits.length };
        this.commits.forEach(c => c.files.forEach(f => this.incr(files, f)));
        return Object.keys(files).sort().map(a => [a, a + '      ' + files[a]]);
      }
    },
    {
      class: 'String',
      name: 'file',
      value: '/',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({choices: X.data.files}, X);
      }
    },
    {
      class: 'Array',
      name: 'paths',
      factory: function() {
        var files = { '/': this.commits.length };
        this.commits.forEach(c => c.files.forEach(f => this.incr(files, this.fileToPath(f))));
        return Object.keys(files).sort().map(a => [a, a + '      ' + files[a]]);
      },
      view: 'foam.u2.view.ChoiceView',
    },
    {
      class: 'String',
      name: 'path',
      value: '/',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({choices: X.data.paths}, X);
      }
    },
    {
      class: 'String',
      name: 'query',
      preSet: function(o, n) { return n.toLowerCase(); },
      onKey: true
    },
    {
      name: 'year',
      value: 2021
    },
    {
      name: 'commits',
      factory: function() {
        return data.
          reverse().
          filter(c => {
            for ( var i = 0 ; i < this.IGNORE_CONTAINS.length ; i++ ) {
              if ( c.subject.indexOf(this.IGNORE_CONTAINS[i]) != -1 ) return false;
            }
            return true;
          }).
          filter(c => {
            for ( var i = 0 ; i < this.IGNORE_EQUALS.length ; i++ ) {
              if ( c.subject === this.IGNORE_EQUALS[i] ) return false;
            }
            return true;
          }).
          map(c => { c.files = c.files.trim().split('\n').map(s => s.trim()); return c; }).
          map(c => { c.author = this.AUTHOR_MAP[c.author] || 'UNKNOWN: ' + c.author; return c; }).
          map(c => {
            c.subjectLC = c.subject.toLowerCase();
            if ( c.subjectLC.indexOf('bench') != -1 )  c.project = 'Performance';
            if ( c.subjectLC.indexOf('pm') != -1 )  c.project = 'Performance';
            if ( c.subjectLC.indexOf('view') != -1 )  c.project = 'U3';
            if ( c.subjectLC.indexOf('medusa') != -1 ) c.project = 'Hybrid Blockchain';
            if ( c.subjectLC.indexOf('json') != -1 ) c.project = 'Hybrid Blockchain';
            if ( c.subjectLC.indexOf('dao') != -1 ) c.project = 'Hybrid Blockchain';
            if ( c.subjectLC.indexOf('mlang') != -1 ) c.project = 'Hybrid Blockchain';
            if ( c.subjectLC.indexOf('demo') != -1 )  c.project = 'U3';
            if ( c.subjectLC.indexOf('example') != -1 )  c.project = 'U3';
            if ( c.subjectLC.indexOf('u2') != -1 )  c.project = 'U3';
            if ( c.subjectLC.indexOf('capab') != -1 )  c.project = 'CRUNCH';
            if ( c.subjectLC.indexOf('nanos') != -1 )  c.project = 'NANOS';
            return c;
          }).
          map(c => { c.date = new Date(c.date * 1000); return c; });
      }
    }
  ],

  methods: [
    function fileToPath(file) {
      var i = file.lastIndexOf('/');
      if ( i == -1 ) return '/';
      return file.substring(0, i);
    },
    function incr(map, key) {
      map[key] = (map[key] || 0) + 1;
    },
    function render() {
      var self = this;

      this.
        start('h2').add('GitLog').end().
        start('span').
          style({float: 'left', 'padding-right': '20px'}).
          add('Year: ').br().add(this.year).
          br().br().
          add('Query: ', this.QUERY).
          br().br().
          add('Project: ', this.PROJECT).
          br().br().
          add('File: ', this.FILE).
          br().br().
          add('Path: ', this.PATH).
          br().br().
          add('Show Files: ', this.SHOW_FILES).
        end().
        tag(this.UserMonthView, {data: this}).
        br().
        tag('hr').
        start('table').attrs({cellpadding: '4px'}).
          start('tr').
            start('th').add('Commit').end().
            start('th').add('Date').end().
            start('th').add('Author').end().
            start('th').add('Project').end().
            start('th').add('Message').end().
            start('th').show(this.showFiles$).add('Files').end().
          end().forEach(this.commits, function(d) {
            var subject = d.subject.toLowerCase();
            var href = 'https://github.com/kgrgreer/foam3/commit/' + d.commit;
            this.start('tr').
              show(self.slot(function(query, author, file, path) {
                return ( author === '-- All --' || author === d.author ) &&
                  ( query === '' || subject.indexOf(query) != -1 ) &&
                  ( file === '/' || d.files.some(f => f === file) ) &&
                  ( path === '/' || d.files.some(f => f.startsWith(path)) ) ;
              })).
              start('td').start('a').attrs({href: href}).add(d.commit).end().end().
              start('td').style({'white-space': 'nowrap'}).add(d.date.toISOString().substring(0,10)).end().
              start('td').style({'white-space': 'nowrap'}).add(d.author).end().
              start('td').style({'white-space': 'nowrap'}).add(d.project).end().
              start('td', {tooltip: d.files}).add(d.subject).end().
              start('td').style({'font-size': 'smaller'}).show(self.showFiles$).forEach(d.files, function(f) { this.start().add(f).end(); } ).end().
            end();
//          this.add(d.commit, ' ', d.date.toISOString().substring(0,10), ' ', d.author, ' ', d.subject).br();
        });
      ;
    }

  ],

  actions: [
  ]
});