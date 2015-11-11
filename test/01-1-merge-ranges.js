'use strict';

/* global T, spawn, test */

let Merge = require('..');
let chalk = require('chalk');

module.exports = spawn(function*() {
  console.log(chalk.bold.yellow('  Timerange Algorithm > Merge'));

  T.from1 = [
    {
      head: 1,
      start: new Date('2015-01-01T10:00:00Z'),
      end: new Date('2015-01-01T11:00:00Z'),
      prop: 'a',
      sum: 5
    }, {
      head: 1,
      start: new Date('2015-01-01T12:00:00Z'),
      end: new Date('2015-01-01T13:00:00Z'),
      prop: 'a',
      sums: {a: 20}
    }, {
      head: 1,
      start: new Date('2015-01-01T14:00:00Z'),
      end: new Date('2015-01-01T15:00:00Z'),
      prop: 'a'
    }, {
      head: 1,
      start: new Date('2015-01-01T16:00:00Z'),
      end: new Date('2015-01-01T17:00:00Z'),
      prop: 'b'
    }
  ];

  T.from2 = [
    {
      head: 1,
      start: new Date('2015-01-01T10:30:00Z'),
      end: new Date('2015-01-01T12:30:00Z'),
      prop: 'a',
      sum: 6,
      sums: {a: 10}
    }, {
      head: 1,
      start: new Date('2015-01-01T14:30:00Z'),
      end: new Date('2015-01-01T16:10:00Z'),
      prop: 'b',
      range: {min: 3, max: 6}
    }, {
      head: 1,
      start: new Date('2015-01-01T16:20:00Z'),
      end: new Date('2015-01-01T19:00:00Z'),
      prop: 'b',
      range: {min: 2, max: 5}
    }
  ];

  T.merged = [];

  T.prop = {
    check: ['prop'],
    copy: ['prop'],
    sum: ['sum', 'sums.a'],
    range: ['range']
  };

  yield Merge.mergeTimeranges({
    from: T.from1,
    to: T.merged,
    prop: T.prop
  });

  yield Merge.mergeTimeranges({
    from: T.from2,
    to: T.merged,
    prop: T.prop
  });

  T.merged [test]('should merge into free ranges (default)', [
    {
      time: 10800,
      head: 1,
      start: new Date('2015-01-01T10:00:00.000Z'),
      end: new Date('2015-01-01T13:00:00.000Z'),
      prop: 'a',
      sums: {a: 30},
      sum: 11
    }, {
      time: 3600,
      head: 1,
      start: new Date('2015-01-01T14:00:00.000Z'),
      end: new Date('2015-01-01T15:00:00.000Z'),
      prop: 'a'
    }, {
      time: 14400,
      head: 1,
      start: new Date('2015-01-01T15:00:00.000Z'),
      end: new Date('2015-01-01T19:00:00.000Z'),
      prop: 'b',
      range: {min: 2, max: 6}
    },
    undefined
  ]);
});
