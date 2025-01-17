/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TableView',
  extends: 'foam.u2.view.UnstyledTableView',

  css: `
    ^ {
      overflow-x: unset;
      height: 100%;
    }

    ^tbody {
      display: flow-root;
    }

    ^tr {
      background: $white;
      display: flex;
      height: 48px;
      justify-content: space-between;
    }

    ^tbody > ^tr:hover {
      background: $grey50;
      border-radius: 4px;
      cursor: pointer;
    }

    ^thead {
      overflow: hidden;
      position: sticky;
      top: 0;
      overflow-x: auto;
    }

    ^thead > ^tr {
      border-bottom: 2px solid $grey300;
      box-sizing: border-box;
      border-radius: 4px 4px 0 0;
    }

    ^td,
    ^th {
      align-self: center;
      box-sizing: border-box;
      color: $black;
      display: block;
      font-size: 1.4rem;
      line-height: 1.5;
      overflow: hidden;
      padding-left: 16px;
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 40px; /* So when the table's width decreases, columns aren't hidden completely */
    }

    ^th:not(:last-child) > img {
      margin-left: 8px;
    }

    ^th:hover {
      cursor: pointer;
    }

    /**
     * OTHER
     */
    ^selected {
      background: $primary50;
    }

    ^noselect {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    ^ .disabled {
      color: #aaa;
    }

    ^td .foam-u2-ActionView {
      padding: 4px 12px;
    }
  `,
});
