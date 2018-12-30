const path = require('path');
const chalk = require('chalk');

const options = {
  script: 'init',
  cli: true,
  logPrefix: '# [ts-build-tools] [postinstall] ',
  callback: function(error, message) {
    if (error) {
      console.error(chalk.grey(options.logPrefix) + chalk.red(message + ' ' + String(error.stack || error)));
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    } else {
      console.log(chalk.grey(options.logPrefix) + chalk.green(message || 'Success.'));
      // eslint-disable-next-line no-process-exit
      process.exit(0);
    }
  },
};

// Resolve from: ${PROJECT_DIR}/node_modules/@sompylasar/ts-build-tools/src/tasks

const toolsInstallPath = path.resolve(__dirname, '../../');
if (
  !(
    path.basename(toolsInstallPath) === '@sompylasar' &&
    path.basename(path.dirname(toolsInstallPath)) === 'node_modules'
  )
) {
  console.log(chalk.grey(options.logPrefix) + chalk.grey('Installed self, skipping init.') + '\n');
  return;
}

require('./paths').overridePaths({
  PROJECT_DIR: path.resolve(__dirname, '../../../../'),
});

console.log(chalk.grey(options.logPrefix) + chalk.yellow('...'));
require('./index').run(options);
