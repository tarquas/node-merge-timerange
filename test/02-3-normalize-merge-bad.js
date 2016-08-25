'use strict';

/* global T, catcha, pro, spawn, test,
      cloneDeep, forEach, extend, chalk */

let Merge = require('..');

module.exports = spawn(function*() {
  console.log(chalk.bold.yellow('  Mongoose > Normalize Merged Ranges > Overlapping'));

  T.Model = {
    findOne: function(query, proj) {
      query [test]('Query should match exactly', {
        end: {
          $gte: new Date('2015-01-01T10:00:00.000Z')
        },
        head: 1
      });

      proj [test]('Query should match exactly', {
        _id: 0,
        start: 1
      });

      return {
        sort: function(sort) {
          sort [test]('Sort must match', {head: 1, end: 1});

          return {
            exec: () => new Promise((resolve) => {
              resolve({start: new Date('2015-01-01T10:00:00Z')});
            })
          };
        }
      };
    },

    find: function(query, proj) {
      query [test]('Query should match exactly', {
        start: {
          $gte: new Date('2015-01-01T10:00:00.000Z'),
          $lte: new Date('2015-01-01T17:00:00.000Z')
        },
        head: 1
      });

      proj [test]('Query should match exactly', {
        _id: 0,
        modifiedAt: 0
      });

      return {
        sort: function(sort) {
          sort [test]('Sort must match', {head: 1, start: 1});

          return {
            exec: () => new Promise((resolve) => {
              resolve(T.from1 [cloneDeep]() [forEach]((item) => {
                item [extend]({toObject: function() {return this;}});
              }));
            })
          };
        }
      };
    }
  };

  T.fromBad = [
    {
      head: 1,
      start: new Date('2015-01-01T12:00:00Z'),
      end: new Date('2015-01-01T13:00:00Z'),
      prop: 'a',
      sums: {a: 20}
    }, {
      head: 1,
      start: new Date('2015-01-01T10:00:00Z'),
      end: new Date('2015-01-01T11:00:00Z'),
      prop: 'a',
      sum: 5
    }, {
      head: 1,
      start: new Date('2015-01-01T12:30:00Z'),
      end: new Date('2015-01-01T12:50:00Z'),
      prop: 'a'
    }, {
      head: 1,
      start: new Date('2015-01-01T16:00:00Z'),
      end: new Date('2015-01-01T17:00:00Z'),
      prop: 'b'
    }
  ];

  let mergeBad = {
    Model: T.Model,
    rangeItems: T.fromBad,
    prop: T.prop
  };

  let result = yield Merge.normalize(mergeBad) [pro]() [catcha]();
  result [test]('Should throw rangeCheckFailed message', ['rangeCheckFailed']);
});
