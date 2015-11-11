'use strict';

/* global T, spawn, test */

let Merge = require('..');
let chalk = require('chalk');

module.exports = spawn(function*() {
  console.log(chalk.bold.yellow('  Timerange Algorithm > Remove'));

  T.removed = [];

  yield Merge.mergeTimeranges({
    from: T.from1,
    to: T.removed,
    prop: T.prop
  });

  yield Merge.mergeTimeranges({
    from: T.from2,
    to: T.removed,
    prop: T.prop,
    remove: true
  });

  T.removed [test]('should merge into free ranges (default)', [
    {
      start: new Date('2015-01-01T10:00:00.000Z'),
      end: new Date('2015-01-01T10:30:00.000Z'),
      time: 1800,
      head: 1,
      prop: 'a',
      sum: 0,
      sums: {a: 0}
    }, {
      start: new Date('2015-01-01T12:30:00.000Z'),
      end: new Date('2015-01-01T13:00:00.000Z'),
      time: 1800,
      head: 1,
      prop: 'a',
      sums: {a: 20}
    }, {
      start: new Date('2015-01-01T14:00:00.000Z'),
      end: new Date('2015-01-01T14:30:00.000Z'),
      time: 1800,
      head: 1,
      prop: 'a',
      sum: 0,
      sums: {a: 0}
    }, {
      start: new Date('2015-01-01T16:10:00.000Z'),
      end: new Date('2015-01-01T16:20:00.000Z'),
      time: 600,
      head: 1,
      prop: 'b',
      sum: 0,
      sums: {a: 0}
    },
    undefined
  ]);

  //console.log('to', JSON.stringify(T.removed, null, 2));
});
