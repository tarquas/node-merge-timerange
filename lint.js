// code linter
//   use: `node lint`

var child = require('child_process');
var chalk = require('chalk');

var paths = ['index.js', 'test'];

function exec(bin, args) {
  return child.spawnSync(bin, args, {stdio: [process.stdin, process.stdout, process.stderr], cwd: __dirname}).status;
}

process.exit(
  (

    console.log(chalk.bold.yellow('JS CodeStyle'), chalk.gray('code formatting')),

    exec('node_modules/.bin/jscs', ['-c', '.jscsrc'].concat(paths))

  ) || (console.log(chalk.bold.green('\n+ Code Style OK\n')), 0) || (

    console.log(chalk.bold.yellow('JSHint'), chalk.gray('code syntax')),

    exec('node_modules/.bin/jshint', [
      '-c', '.jshintrc',
      '--reporter', 'node_modules/jshint-stylish-ex/stylish.js'
    ].concat(paths))

  ) || (

    console.log(chalk.bold.yellow('JS Inspect'), chalk.gray('copy & paste detector')),

    exec('node_modules/.bin/jsinspect', [].concat(paths))

  ) || (console.log(chalk.bold.green('\n===== All Linters Succeeded =====')), 0)
);
