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

  merge2.insertsShouldBe = T.removed.slice(1).concat(undefined);
  merge2.inserts [test]('merged inserts should match', merge2.insertsShouldBe);

  merge2.removesShouldBe = T.from1.slice(0, 1).concat(T.from1.slice(2)).concat(undefined);
  merge2.removes [test]('merged removes should match', merge2.removesShouldBe);

  merge2.removeCmdsShouldBe = (
    merge2.removesShouldBe.map(item => item && item [pick]('head', 'start', 'end'))
  );

  merge2.removeCmds [test]('merged remove cmds should match', merge2.removeCmdsShouldBe);

  T.Model.collection = {};

  T.Model.collection.insert = (items, cb) => {
    items [test]('Model.collection.insert arguments should match', merge2.insertsShouldBe);
    cb(null, {});
  };

  T.Model.remove = (items) => new Promise((resolve) => {
    items [test]('Model.remove arguments should match', {$or: merge2.removeCmdsShouldBe});
    resolve({});
  });

  yield Merge.save(merge2);
});
