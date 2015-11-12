'use strict';

/* global T, spawn, test,
      cloneDeep, forEach, extend */

let Merge = require('..');
let chalk = require('chalk');

module.exports = spawn(function*() {
  console.log(chalk.bold.yellow('  Mongoose > Normalize Merged Ranges'));

  T.Model = {
    findOne: function(query, proj) {
      query [test]('Query should match exactly', {
        end: {
          $gte: new Date('2015-01-01T11:00:00.000Z')
        },
        head: 1
      });

      proj [test]('Query should match exactly', {
        _id: 0,
        start: 1
      });

      return {sort: function(sort) {
        sort [test]('Sort must match', {head: 1, end: 1});

        return {exec: () => new Promise((resolve) => {
          resolve({start: new Date('2015-01-01T10:00:00Z')});
        })};
      }};
    },

    find: function(query, proj) {
      query [test]('Query should match exactly', {
        start: {
          $gte: new Date('2015-01-01T10:00:00.000Z'),
          $lte: new Date('2015-01-01T19:00:00.000Z')
        },
        head: 1
      });

      proj [test]('Query should match exactly', {
        _id: 0,
        modifiedAt: 0
      });

      return {sort: function(sort) {
        sort [test]('Sort must match', {head: 1, start: 1});

        return {exec: () => new Promise((resolve) => {
          resolve(T.from1 [cloneDeep]() [forEach]((item) => {
            item [extend]({toObject: function() {return this;}});
          }));
        })};
      }};
    }
  };

  let merge1 = {
    Model: T.Model,
    rangeItems: T.from2 [cloneDeep](),
    prop: T.prop
  };

  yield Merge.normalize(merge1);

  merge1.inserts [test]('merged rangeItems should match', [
    {
      time: 10800,
      head: 1,
      start: new Date('2015-01-01T10:00:00.000Z'),
      end: new Date('2015-01-01T13:00:00.000Z'),
      prop: 'a',
      sums: {a: 30},
      sum: 11
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

  merge1.removes [test]('should merge into free ranges (default)', [
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
      start: new Date('2015-01-01T16:00:00Z'),
      end: new Date('2015-01-01T17:00:00Z'),
      prop: 'b'
    },
    undefined
  ]);

  merge1.removeCmds [test]('should merge into free ranges (default)', [
    {
      head: 1,
      start: new Date('2015-01-01T10:00:00Z'),
      end: new Date('2015-01-01T11:00:00Z')
    }, {
      head: 1,
      start: new Date('2015-01-01T12:00:00Z'),
      end: new Date('2015-01-01T13:00:00Z')
    }, {
      head: 1,
      start: new Date('2015-01-01T16:00:00Z'),
      end: new Date('2015-01-01T17:00:00Z')
    },
    undefined
  ]);

  let merge2 = {
    Model: T.Model,
    rangeItems: T.from2 [cloneDeep](),
    prop: T.prop,
    remove: true
  };

  yield Merge.normalize(merge2);
});
