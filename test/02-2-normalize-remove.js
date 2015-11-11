'use strict';

/* global T, spawn, test,
      cloneDeep, pick */

let Merge = require('..');
let chalk = require('chalk');

module.exports = spawn(function*() {
  console.log(chalk.bold.yellow('  Mongoose > Normalize Removed Ranges'));

  let merge2 = {
    Model: T.Model,
    rangeItems: T.from2 [cloneDeep](),
    prop: T.prop,
    remove: true
  };

  yield Merge.normalize(merge2);

  merge2.insertsShouldBe = T.removed.concat(undefined);
  merge2.inserts [test]('merged rangeItems should match', merge2.insertsShouldBe);

  merge2.removesShouldBe = T.from1.concat(undefined);
  merge2.removes [test]('should merge into free ranges (default)', merge2.removesShouldBe);

  merge2.removeCmdsShouldBe = (
    T.from1.map(item => item [pick]('head', 'start', 'end'))
  ).concat(undefined);

  merge2.removeCmds [test]('should merge into free ranges (default)', merge2.removeCmdsShouldBe);

  T.Model.collection = {};

  T.Model.collection.insert = (items, cb) => {
    items [test]('merged rangeItems should match', merge2.insertsShouldBe);
    cb(null, {});
  };

  T.Model.remove = (items) => new Promise((resolve) => {
    items [test]('should merge into free ranges (default)', merge2.removeCmdsShouldBe);
    resolve({});
  });

  yield Merge.save(merge2);
});
