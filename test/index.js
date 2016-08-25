'use strict';
require('esfunctional');

/* global by, main, chalk, out */

let S = module.exports;

S.init = true;

S.by = S.init [by]();

S.test = function*() {};

module [main](function*() {
  out.ns('test');
  out.info(chalk.bold.green('Starting tests'));

  let files = require('fs').readdirSync(__dirname).sort();
  for (let file of files) if (/\.js$/.test(file)) yield* require('./' + file).test();

  out.info(chalk.bold.green('All tests succeeded'));
});
