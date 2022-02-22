/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

/**
 * TODO:
 * - Migrate from execCommand as it has been deprecated, 
 *   but it is still supported across browsers so maybe not?
 * - Add file support
 * - Add placeholder
 * - Fix button styling
 * - Show button states on selection
 * - Make a toolbar
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RichTextView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.menu.LinkMenu',
    'foam.u2.ToggleActionView',
    'foam.u2.view.RichTextValidator'
  ],
  imports: ['window', 'document'],

  css: `
    ^{
      border: 1px solid /*%GREY4%*/ #6B778C;
      border-radius: 4px;
      /* Required to prevent <div>s being added on 'enter' key
      display: inline-block; */
      padding: 10px;
      overflow: auto;
    }
    ^dragged{
      background: /*%PRIMARY5%*/ #E5F1FC;
      border: 2px dashed /*%PRIMARY3%*/ #406DEA;
    }
    ^dragged::after{
      content: "Drop Here";
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 100;
      font-weight: bold;
    }
    ^ButtonToolbar {
      display: flex;
      gap: 8px;
    }
    ^seperator{
      background: /*%GREY2%*/ #6B778C;
      width: 1px;
    }
    ^tool.foam-u2-ActionView {
      padding: 6px 10px;
      max-height: unset;
    }
  `,
  properties: [
    {
      class: 'String',
      name: 'height',
      value: '400'
    },
    {
      class: 'String',
      name: 'width',
      value: '100%'
    },
    {
      name: 'data',
      postSet: function() { console.log(this.data) }
    },
    {
      name: 'placeholder',
      description: 'Placeholder text to appear when no text is entered.'
    },
    'richText', 'richTextDocument', 'richTextWindow', 'currentSel_',
    ['allowSelections', false],
    ['isDragged_', false],
    {
      class: 'Proxy',
      of: 'foam.u2.DefaultValidator',
      name: 'validator',
      factory: function() {
        return this.RichTextValidator.create();
      }
    }, 'bold_','italic_','underline_', 'link_'
  ],
  methods: [
    function render() {
      this.SUPER();
      var actions = this.cls_.getAxiomsByClass(foam.core.Action);
      this.onDetach(this.document.addEventListener('selectionchange', () => {
        if ( ! this.allowSelection ) return;
        this.currentSel_ = this.window.getSelection().getRangeAt(0);
      }));
      // this.allowSelection$.sub(() => console.log('select:', this.allowSelection))
      this
        // .start('iframe', {}, this.richText$)
        //   .addClass(this.myClass())
        //   .style({ width: '100%', height: '500px', overflow: 'auto' })
        //   .enableClass(this.myClass('dragged'), this.isDragged_$)
        // .end()
        .start('', {}, this.richText$)
          .addClass(this.myClass())
          .style({ width: '100%', height: '500px', overflow: 'auto' })
          .attr('contentEditable', true)
          .enableClass(this.myClass('dragged'), this.isDragged_$)
          .on('input', this.parseInnerHTML)
          .on('focus', () => {this.allowSelection = true;})
          .on('blur', () => {this.allowSelection = false;})
          // TODO: sanitise pasted HTML???
          .on('keydown', e => {
            if ( e.keyCode === 13 ) {
              // prevent the default behaviour of return key (creating a new div)
              this.richTextDocument.execCommand('defaultParagraphSeparator', false, '<br/>');
              return false;
            }
          })
          .on('dragover', e => { this.isDragged_ = true; e.preventDefault(); })
          .on('dragenter', e => { this.isDragged_ = true; e.preventDefault(); })
          .on('dragleave', e => { this.isDragged_ = false; e.preventDefault(); })
          .on('drop', this.onDrop)
        .end()
        .startContext({ data: this })
        .start()
          .addClass(this.myClass('ButtonToolbar'))
          .tag(this.ToggleActionView, {
            action: this.BOLD,
            data: this
          }, this.bold_$)
          .tag(this.ToggleActionView, {
            action: this.ITALIC,
            data: this
          }, this.italic_$)
          .tag(this.ToggleActionView, {
            action: this.UNDERLINE,
            data: this
          },this.underline_$)
          .tag(this.LINK, {}, this.link_$)
          .start().addClass(this.myClass('seperator')).end()
          .start(this.LEFT_JUSTIFY, { themeIcon: 'leftAlign', size: 'SMALL' }).addClass(this.myClass('tool')).end()
          .start(this.CENTER_JUSTIFY, { themeIcon: 'centerAlign', size: 'SMALL' }).addClass(this.myClass('tool')).end()
          .start(this.RIGHT_JUSTIFY, {  themeIcon: 'rightAlign',size: 'SMALL' }).addClass(this.myClass('tool')).end()
          .start().addClass(this.myClass('seperator')).end()
          .start(this.NUMBERED_LIST, { themeIcon: 'numberedList', size: 'SMALL' }).addClass(this.myClass('tool')).end()
          .start(this.BULLET_LIST, { themeIcon: 'bulletedList', size: 'SMALL' }).addClass(this.myClass('tool')).end()
          .start(this.BLOCK_QUOTE, { themeIcon: 'blockQuote', size: 'SMALL' }).addClass(this.myClass('tool')).end()
        .end()
        .endContext();

      // Set up toggle listeners
      this.bold_.actionState$.mapFrom(this.currentSel_$, () => { return this.document.queryCommandState('bold') });
      this.italic_.actionState$.mapFrom(this.currentSel_$, () => { return this.document.queryCommandState('italic') })
      this.underline_.actionState$.mapFrom(this.currentSel_$, () => { return this.document.queryCommandState('underline') })
      this.richText.el().then( el => {
        this.richTextDocument = this.document;
        this.richTextWindow = this.window;
      });
    },
    function saveCaretPosition() {
        var selection = this.richTextWindow.getSelection();
        var range = selection.getRangeAt(0);
        range.setStart(this.richTextDocument.body, 0);
        return range.toString().length;
    },
    function restore(len) {
      var pos = this.getTextNodeAtPosition(this.richTextDocument.body, len);
      this.richTextWindow.getSelection().removeAllRanges();
      var range = new Range();
      range.setStart(pos.node, pos.position);
      this.richTextWindow.getSelection().addRange(range);
    },
    function getTextNodeAtPosition(root, index) {
        const NODE_TYPE = NodeFilter.SHOW_TEXT;
        var treeWalker = document.createTreeWalker(root, NODE_TYPE, function next(elem) {
            if ( index > elem.textContent.length ) {
                index -= elem.textContent.length;
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        });
        var c = treeWalker.nextNode();
        return {
            node: c? c: root,
            position: c? index: 0
        };
    },
    function sanitizeDroppedHtml(html) {
      return this.validator.sanitizeText(html.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    },
    function getSelectionText() {
      var window    = this.richTextWindow;
      var selection = window.getSelection();

      if ( selection.rangeCount ) {
        return selection.getRangeAt(0).toLocaleString();
      }

      return '';
    },
    function insertElement(e, sel) {
      // Can we transition this to use U2?
      var win    = this.richTextWindow;
      var selection = win.getSelection();

      if ( sel || selection.rangeCount ) {
        // should it always use currentSel_??
        var range = sel || selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(e);
        range.collapse();
      } else {
        // just insert into the body if no range selected
        var range = this.richTextDocument.createRange();
        range.selectNodeContents(this.richText.el_());
        range.collapse();
        range.insertNode(e);
      }
      selection.removeAllRanges();
      selection.addRange(range);

      // Update the value directly because modifying the DOM programatically
      // doesn't fire an update event.
      this.parseInnerHTML();
    },
    function resetCommandState(cmd) {
      if ( this.document.queryCommandState(cmd) ) {
        this.document.execCommand(cmd)
      } 
    }
  ],

  listeners: [
    {
      name: 'onDrop',
      code: function(e) {
        e.preventDefault();
        this.isDragged_ = false;
        // TODO: add file support
        // var length = e.dataTransfer.files.length;
        // for ( var i = 0 ; i < length ; i++ ) {
        //   var file = e.dataTransfer.files[i];
        //   var id = this.addAttachment(file);
        //   if ( file.type.startsWith("image/") ) {
        //     var img   = document.createElement('img');
        //     img.id = id;
        //     img.src = URL.createObjectURL(file);
        //     this.insertElement(img);
        //   }
        // }

        length = e.dataTransfer.items.length;
        if ( length ) {
          console.log(e.dataTransfer.getData('text/html'));
          var txt = e.dataTransfer.getData('text/html');
          if ( ! txt )
            txt = e.dataTransfer.getData('text/plain') //.replace(/\n/g, '<br />')
          var div = this.sanitizeDroppedHtml(txt);
          console.log(div);
          this.insertElement(div);
        }
      }
    },
    // Potential replacement for execCommand() or some fancy trickery
    // Consider using inputEvents instead of adding divs
    function formatSelection(cssProperty, value) {
        let selection = this.richTextWindow.getSelection().getRangeAt(0);
        let selectedText = selection.extractContents();
        let span = this.richTextDocument.createElement('div');
        try{
            span.style[cssProperty] = value;
        }catch(e){
            console.trace(e);
        }    
        span.appendChild(selectedText);
        selection.insertNode(span);
    },
    function parseInnerHTML(e) {
      if ( e?.dataTransfer?.getData('text/html') ) {
        var txt = e?.dataTransfer?.getData('text/html')
        this.insertElement(this.sanitizeDroppedHtml(txt));
        e.stopPropogation();
        e.preventDefault();
        return;
      }

      var el = this.richText.el_();
      var newText;
      // Is this needed?
      newText = el.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      this.data = newText;
    },
    {
      name: 'maybeShowPlaceholder',
      code: function() {
        var e = this.placeholderId;
        if ( e ) {
          e.style.visibility = this.data == '' ? 'visible' : 'hidden';
        }
      }
    }
  ],
  actions: [
    // TODO: fix keyboard shortcuts
    {
      name: 'bold',
      label: 'B',
      toolTip: 'Bold',
      code: function () {
        this.richText.focus();
        this.richTextDocument.execCommand("bold");
      }
    },
    {
      name: 'italic',
      label: 'I',
      toolTip: 'Italic',
      code: function () {
        this.richText.focus();
        this.richTextDocument.execCommand("italic");
      }
    },
    {
      name: 'underline',
      label: 'U',
      toolTip: 'Underline',
      code: function () {
        this.richText.focus();
        this.richTextDocument.execCommand("underline");
      }
    },
    {
      name: 'link',
      label: 'Link',
      toolTip: 'Insert link',
      code: function () {
        var rect = this.link_.el_().getBoundingClientRect();
        this.RichLink.create({
          richTextView: this,
          label: this.getSelectionText()}).open(rect.x, rect.y);
      }
    },
    {
      name: 'leftJustify',
      label: '',
      themeIcon: 'leftAlign',
      buttonStyle: 'TERTIARY',
      toolTip: 'Align Left',
      // Ctrl-Shift-L
      code: function() {
        // this.richTextDocument.body.focus();
        this.richText.focus();
        this.richTextDocument.execCommand("justifyLeft");
      }
    },
    {
      name: 'centerJustify',
      label: '',
      themeIcon: 'centerAlign',
      buttonStyle: 'TERTIARY',
      toolTip: 'Align Center',
      // Ctrl-Shift-E
      code: function() {
        // this.richTextDocument.body.focus();
        this.richText.focus();
        this.richTextDocument.execCommand("justifyCenter");
      }
    },
    {
      name: 'rightJustify',
      label: '',
      themeIcon: 'rightAlign',
      buttonStyle: 'TERTIARY',
      toolTip: 'Align Right',
      // Ctrl-Shift-R
      code: function() {
        // this.richTextDocument.body.focus();
        this.richText.focus();
        this.richTextDocument.execCommand('justifyRight');
      }
    },
    {
      name: 'numberedList',
      label: '',
      buttonStyle: 'TERTIARY',
      toolTip: 'Numbered List',
      // Ctrl-Shift-7
      code: function() {
        this.richText.focus();
        this.richTextDocument.execCommand('insertOrderedList');
      }
    },
    {
      name: 'bulletList',
      label: '',
      buttonStyle: 'TERTIARY',
      toolTip: 'Bulleted List',
      // Ctrl-Shift-8
      code: function() {
        this.richText.focus();
        this.richTextDocument.execCommand('insertUnorderedList');
      }
    },
    // {
    //   name: 'decreaseIndentation',
    //   label: '',
    //   buttonStyle: 'TERTIARY',
    //   toolTip: 'Indent Less',
    //   // Ctrl-[
    //   code: function() {
    //     this.richText.focus();
    //     this.richTextDocument.execCommand('outdent');
    //   }
    // },
    // {
    //   name: 'increaseIndentation',
    //   label: '',
    //   buttonStyle: 'TERTIARY',
    //   toolTip: 'Indent More',
    //   // Ctrl-]
    //   code: function() {
    //     this.richText.focus();
    //     this.richTextDocument.execCommand('indent');
    //   }
    // },
    {
      name: 'blockQuote',
      label: '',
      buttonStyle: 'TERTIARY',
      toolTip: 'Quote',
      // Ctrl-Shift-9
      code: function() {
        this.richText.focus();
        this.richTextDocument.execCommand('formatBlock', true, '<blockquote>');
      }
    }
  ],
  classes: [
    {
      name: 'RichLink',
      extends: 'foam.u2.Element',
      requires: [
        'foam.u2.md.OverlayDropdown',
      ],
      css: `
        ^ {
          display: flex;
          flex-direction: column;  
        }
        ^ > * + * {
          margin-top: 8px;
        }
        ^insert {
          align-self: flex-end;
        }
      `,
      properties: [
        {
          class: 'FObjectProperty',
          of: 'foam.u2.Element',
          name: 'overlay_',
          factory: function() {
            return this.OverlayDropdown.create({closeOnLeave: false});
          }
        },
        {
          name: 'richTextView'
        },
        {
          class: 'String',
          name: 'label',
        },
        {
          class: 'String',
          name: 'link',
          placeholder: 'Type or paste link.',
          preSet: function(_, value) {
            value = value.trim();
            // Disallow javascript URL's
            if ( value.toLowerCase().startsWith('javascript:') ) value = '';
            return value;
          }
        },
        'sel',
        ['overlayInitialized_', false]
      ],
      methods: [
        function initializeOverlay() {
          this.overlayInitialized_ = true;
          this.overlay_.parentEl = this.richTextView;
          this.overlay_
            .start()
              .addClass(this.myClass())
              .startContext({ data: this })
                .add(this.LABEL)
                .add(this.LINK)
                .start()
                  .addClass(this.myClass('insert'))
                  .add(this.INSERT)
                .end()
              .endContext()
            .end();
          ctrl.add(this.overlay_);
        },
        function open(x, y) {
          if ( ! this.overlayInitialized_ ) this.initializeOverlay();
          this.overlay_.open(x, y);
        }
      ],
      actions: [
        {
          name: 'insert',
          label: 'Add Link',
          buttonStyle: 'PRIMARY',
          toolTip: 'Insert this link into the document.',
          code: function() {
            // Figure this out
            // var el = this.E('a').attr('href', (this.link || '')).add(this.label || this.link || '');
            var el = this.document.createElement('a');
            el.href = this.link || '';
            el.target = '_blank';
            el.title = this.label || this.link || '';
            el.appendChild(this.document.createTextNode(this.label || this.link || ''));
            this.richTextView.insertElement(el, this.richTextView.currentSel_);
            this.richTextView.richTextDocument.body.focus();
            this.overlay_.close();
          }
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RichTextValidator',
  extends: 'foam.u2.DefaultValidator',

  axioms: [ foam.pattern.Singleton.create() ],

  imports: ['document'],

  requires: ['foam.u2.Element'],

  methods: [
    function sanitizeText(text) {
      var allowedElements = [
        {
          name: 'B',
          attributes: []
        },
        {
          name: 'I',
          attributes: []
        },
        {
          name: 'U',
          attributes: []
        },
        {
          name: 'P',
          attributes: []
        },
        {
          name: 'SECTION',
          attributes: []
        },
        {
          name: 'BR',
          attributes: []
        },
        {
          name: 'BLOCKQUOTE',
          attributes: []
        },
        {
          name: 'DIV',
          attributes: []
        },
        // TODO: add img support
        // {
        //   name: 'IMG',
        //   attributes: ['src'],
        //   clone: function(node) {
        //     var newNode = document.createElement('img');
        //     if ( node.src.startsWith('http') ) {
        //       var xhr = new XMLHttpRequest();
        //       xhr.open("GET", node.src);
        //       xhr.responseType = 'blob';
        //       xhr.send(function(blob) {
        //         blob.name = 'dropped image';
        //         if ( blob ) {
        //           newNode.id = self.addAttachment(blob);
        //           newNode.src = URL.createObjectURL(blob);
        //         } else {
        //           blob.parent.removeChild(blob);
        //         }
        //         self.updateValue();
        //       });
        //     } else if ( node.src.startsWith('data:') ) {
        //       // var type = node.src.substring(5, node.src.indexOf(';'));
        //       // var decoder = self.Base64Decoder.create({ bufsize: node.src.length });
        //       // decoder.put(node.src.substring(node.src.indexOf('base64,') + 7));
        //       // decoder.eof();
      
        //       // var blob = new Blob(decoder.sink, { type: type });
        //       // blob.name = 'dropped image';
        //       // newNode.id = self.addAttachment(blob);
        //       // newNode.src = URL.createObjectURL(blob);
        //     } else {
        //       // Unsupported image scheme dropped in.
        //       return null;
        //     }
      
        //     return newNode;
        //   }
        // },
        {
          name: 'A',
          attributes: ['href']
        },
        {
          name: 'SPAN',
          attributes: ['href']
        },
        {
          name: '#text',
          attributes: []
        },
      ];
      // Use U2 to create new nodes
      function copyNodes(parent, node) {
        for ( var i = 0; i < allowedElements.length; i++ ) {
          if ( allowedElements[i].name === node.nodeName ) {
            if ( allowedElements[i].clone ) {
              newNode = allowedElements[i].clone(node);
            } else if ( node.nodeType === Node.ELEMENT_NODE ) {
              newNode = this.document.createElement(node.nodeName);
              for ( var j = 0; j < allowedElements[i].attributes.length; j++ ) {
                if ( node.hasAttribute(allowedElements[i].attributes[j]) ) {
                  newNode.setAttribute(allowedElements[i].attributes[j],
                                       node.getAttribute(allowedElements[i].attributes[j]));
                }
              }
              // Is this still safe?
              newNode.textContent = node.textContent;
            } else if ( node.nodeType === Node.TEXT_NODE ) {
              newNode = document.createTextNode(node.nodeValue);
            } else {
              newNode = document.createTextNode('');
            }
            break;
          }
        }
        if ( i === allowedElements.length ) {
          // Should this be span? Div adds breaks, check gmail
          newNode = document.createElement('div');
          // Only for testing
          newNode.innerHTML = 'replaced node';
        }
        if ( newNode && parent.appendChild ) parent.appendChild(newNode);
        //ChildNode vs children??
        for ( j = 0; j < node.children.length; j++ ) {
          copyNodes(newNode, node.children[j]);
        }
      }
      
      var frame = this.document.createElement('iframe');
      frame.sandbox = 'allow-same-origin';
      frame.style.display = 'none';
      this.document.body.appendChild(frame);
      frame.contentDocument.body.innerHTML = text;
      
      var sanitizedContent = new DocumentFragment();
      for ( var i = 0; i < frame.contentDocument.body.children.length; i++ ) {
        copyNodes(sanitizedContent, frame.contentDocument.body.children[i]);
      }
      this.document.body.removeChild(frame);
      return sanitizedContent;
    }
  ]
});


