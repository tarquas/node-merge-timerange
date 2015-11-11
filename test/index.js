'use strict';
require('esfunctional');

/* global spawn, thena, catcha */

let chalk = require('chalk');

global.T = {};

spawn(function*() {
  console.log(chalk.bold.green('Starting tests'));

  let files = require('fs').readdirSync(__dirname).sort();
  for (let file of files) if (/\.js$/.test(file)) yield require('./' + file);

  console.log(chalk.bold.green('All tests succeeded'));
})

// emit exit code
[thena](process.exit)

//error handler
[catcha]((err) => {
  console.log(err.stack);
  process.exit(1);
});
