'use strict';

/* global test, chalk */

let T = require('.');
let Merge = require('..');

let S = module.exports;

S.test = T.by(function*() {
  console.log(chalk.bold.yellow('  Timerange Algorithm > Remove'));

  T.removed = [];

  yield* Merge.mergeTimeranges({
    from: T.from1,
    to: T.removed,
    prop: T.prop
  });

  yield* Merge.mergeTimeranges({
    from: T.from2,
    to: T.removed,
    prop: T.prop,
    remove: true
  });

  T.removed [test]('should remove ranges', [
    {
      start: new Date('2015-01-01T10:00:00.000Z'),
      end: new Date('2015-01-01T11:00:00.000Z'),
      time: 3600,
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
