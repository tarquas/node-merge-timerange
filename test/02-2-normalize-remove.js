'use strict';

/* global T, spawn, test */

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

  merge2.inserts [test]('merged rangeItems should match', T.removed.concat(undefined));

  merge2.removes [test]('should merge into free ranges (default)', T.from1.concat(undefined));

  merge2.removeCmds [test]('should merge into free ranges (default)', (
    T.from1.map(item => item [pick]('head', 'start', 'end'))
  ).concat(undefined));
});
