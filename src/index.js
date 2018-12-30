const chalk = require('chalk');
const debug = require('debug')('ts-build-tools');

module.exports.run = function(options) {
  const script = options.script;
  const args = options.args; // eslint-disable-line no-unused-vars
  const cli = options.cli;

  const knownScripts = ['build', 'clean', 'dev', 'init', 'lint', 'test'];

  const logPrefix =
    chalk.grey(options.logPrefix || '# [ts-build-tools] ') +
    chalk.green(require('./paths').packageName) +
    ' ' +
    chalk.white(script) +
    ' ';

  const callback = function(error) {
    const callback = options.callback;
    if (cli) {
      if (error) {
        let errorForDisplay = error.stack || error;
        if (/^TsBuildTools/.test(error.name)) {
          errorForDisplay = error.name + ': ' + error.message;
        }
        console.error(logPrefix + chalk.red('ERROR'), errorForDisplay);
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      } else {
        console.log(logPrefix + chalk.green('SUCCESS'));
        // eslint-disable-next-line no-process-exit
        process.exit(0);
      }
    } else if (callback) {
      callback(error);
    }
  };

  if (knownScripts.indexOf(script) < 0) {
    process.nextTick(function() {
      callback(new Error('Unknown script: ' + script));
    });
    return;
  }

  console.log(logPrefix + chalk.yellow('...'));

  if (cli && debug.enabled) {
    const paths = require('./paths').paths;
    console.log(
      logPrefix +
        '\n  ' +
        Object.keys(paths)
          .map(function(key) {
            return chalk.grey('- ' + key + ': ') + paths[key];
          })
          .join('\n  '),
    );
  }

  const task = require('./tasks/' + script);

  process.nextTick(function() {
    task(
      Object.assign({}, options, {
        logPrefix: logPrefix,
        callback: callback,
      }),
    );
  });
};

module.exports.cli = function(script, args) {
  const options = {
    script: script,
    args: args,
    cli: true,
    logPrefix: '# [ts-build-tools-cli] ',
    callback: function(error) {
      if (error) {
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      }

      // eslint-disable-next-line no-process-exit
      process.exit(0);
    },
  };
  const run = module.exports.run;
  run(options);
};

module.exports.chai = require('chai');

module.exports.assert = require('chai').assert;

module.exports.sinon = require('sinon');
