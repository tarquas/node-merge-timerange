'use strict';
require('esfunctional');

// code linter
//   use: `node lint`

/* global spawn, main, finalizer, halt, errstack, out, chalk */

let child = require('child_process');

let paths = ['index.js', 'lint.js', 'test'];

let S = module.exports;

S.exec = (bin, args) => spawn(function*() {
  let lintingFailed = new Error('Linting failed') [errstack](5, 1);
  let proc = child.spawn(bin, args, {stdio: 'inherit', cwd: __dirname});
  S.currentProc = proc;
  let evt = yield proc [event](['exit', 'close'], ['error', 'unhandledException']);
  S.currentProc = null;
  if (evt.data) throw lintingFailed;
});

S.init = spawn(function*() {
  out.setNs('lint');

  out.info(chalk.bold.yellow('JS CodeStyle'), chalk.gray('code formatting'));
  yield S.exec('node_modules/.bin/jscs', ['-c', '.jscsrc'].concat(paths));
  console.log(chalk.bold.green('\n+ Code Style OK\n'));

  out.info(chalk.bold.yellow('JSHint'), chalk.gray('code syntax'));

  yield S.exec('node_modules/.bin/jshint', [
    '-c', '.jshintrc',
    '--reporter', 'node_modules/jshint-stylish-ex/stylish.js'
  ].concat(paths));

  out.info(chalk.bold.yellow('JS Inspect'), chalk.gray('copy & paste detector'));
  yield S.exec('node_modules/.bin/jsinspect', [].concat(paths));

  console.log(chalk.bold.green('\n===== All Linters Succeeded ====='));
});

S.exit = () => spawn(function() {
  S.init [halt]();
  if (S.currentProc) S.currentProc.kill('SIGTERM');
});

module [main](S.init);
module [finalizer](S.exit);
