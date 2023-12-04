/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'FragmentedTextField',
  extends: 'foam.u2.View',

  documentation: `
    FormattedTextField should now be prefered over this view.
    
    FragmentedTextField displays a text input made of multiple text fields
    separated by read-only strings. This can be used for formatted inputs.
  `,

  requires: [
    'foam.core.ArraySlot',
  ],

  css: `
    ^ {
      display: flex;
      position: relative;
      gap: 0.5rem;
    }
    ^fragment {
      text-align: center;
      border-radius: 2px;
      aspect-ratio: 1;
    }
    ^fragment.foam-u2-TextField {
      min-width: 0px;
    }
    ^fragment.element.style {
      width: 0px;
    }
    ^fragment:invalid {
      background: $grey50;
    }
    ^fragment:valid {
      background: $white;
    }
  `,

  constants: [
    {
      type: 'Array',
      name: 'BACKSPACE_OR_DELETE',
      value: [8 /*backspace*/, 46 /*delete*/]
    }
  ],

  properties: [
    {
      name: 'delegates',
      class: 'Array'
    },
    {
      class: 'Int',
      name: 'currentIndex',
      value: 0,
      preSet: function(old, nu) {
        if ( nu > this.numOfParts - 1 ) return this.numOfParts - 1;
        if ( nu < 1 ) return 0;
        return nu;
      }
    },
    {
      class: 'Int',
      name: 'numOfParts',
      value: 0
    }
  ],

  methods: [
    function render() {
      return this
        .addClass(this.myClass())
        .createInnerFields()
    },
    function createInnerFields() {
      var slots = [];
      for ( let i = 0 ; i < this.delegates.length ; i++ ) {
        let e = this.delegates[i];
        let eView;
        if ( typeof e === 'string' ) {
          this.start().addClass(this.myClass('symbol'))
            .add(e).end();
          continue;
        } else if ( e.cls_ === foam.u2.FragmentedTextFieldFragment ) {
          eView = e.view;
        }
        var u2Elem = this.start(eView, { data$: e.data$ })
        .style({ width: (this.delegates[i].maxLength * 4) + 'rem' })
          .addClass(this.myClass('fragment'))
          .attr('required', true)
        u2Elem.on('focus', () => {
          this.currentIndex = i;
        });
        u2Elem.on('keydown', evt => {
          if ( this.BACKSPACE_OR_DELETE.includes(evt.keyCode) ) {
            evt.preventDefault();
            evt.stopPropagation();
            this.onDelete();
          }
        });
        slots.push(u2Elem.data$);
      }

      this.data$ = this.ArraySlot.create({ slots }).map(arr => {
        return '' + arr.join('');
      });
      this.data$.sub(this.onDataUpdate);
      this.numOfParts = this.delegates.length;

      return this;
    },
    function processData(data, index, arr) {
      // returns an array of data chunks in the size of the delegates
      var currentElement = this.childNodes[index];
      if ( ! data || ! currentElement ) return arr;

      var maxLength = this.delegates[index].maxLength;
      arr.push(data.substring(0, maxLength));
      return this.processData(data.substring(maxLength), index + 2, arr);
    },
    async function onDelete() {
      // do the deletion
      var el = await this.childNodes[this.currentIndex].el();
      var start = el.selectionStart == el.selectionEnd && el.selectionStart > 0 ? el.selectionStart - 1 : el.selectionStart;
      this.childNodes[this.currentIndex].data = el.value.substr(0, start) + el.value.substr(el.selectionEnd);
      // if there is more data before the cursor position, do not move to previous textfield
      el.selectionStart = el.selectionEnd = start;
      if ( el.value && el.selectionStart > 0 ) return;
      var prevIndex = this.currentIndex > 0 ? this.currentIndex - 1 : 0;
      while ( this.childNodes[prevIndex] && ! foam.u2.TextField.isInstance(this.childNodes[prevIndex]) ) {
        prevIndex--;
      }
      if ( this.currentIndex != prevIndex ) {
        var prev = this.childNodes[prevIndex];
        var prevE = await prev.el();
        prevE.setSelectionRange(prev.data.length + 1, prev.data.length + 1);
        prev.focus();
      }
    }
  ],

  listeners: [
    {
      name: 'onDataUpdate',
      code: function() {
        var arr = this.processData(this.childNodes[this.currentIndex].data, this.currentIndex, []);
        for ( var i = 0; i < arr.length; i++ ) {
          var nextIndex = this.currentIndex + 1;
          while ( this.childNodes[nextIndex] && ! foam.u2.TextField.isInstance(this.childNodes[nextIndex]) ) {
            nextIndex++;
          }
          this.childNodes[this.currentIndex].data = arr[i];
          if ( next = this.childNodes[nextIndex] ) {
            if ( this.delegates[this.currentIndex].maxLength > arr[i].length ) break;

            if ( ! ( next && next.data ) ) {
              this.currentIndex = nextIndex;
              next.focus();
            } else break;
          }
        }
        this.childNodes[this.currentIndex].focus();
      }
    }
  ]
});
