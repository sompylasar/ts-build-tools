const which = require('npm-which')(__dirname);
const remove = require('../remove');
const spawn = require('../spawn');

module.exports = function(options) {
  const callback = options.callback || function() {};

  const testsTimeout = 120000;

  // TODO(@sompylasar): Enable fail on coverage when we're full with tests.
  const shouldFailOnCoverageCheck = false;
  const coverageCheckLinesThreshold = 80;

  function onTestDone(error) {
    if (error) {
      if (error.name === 'TsBuildToolsSpawnProcessExitedWithNonZeroCodeError') {
        if (shouldFailOnCoverageCheck) {
          const testCoverageError = new Error('Test run or coverage check failed. See output for details.');
          testCoverageError.name = 'TsBuildToolsTestRunOrCoverageCheckFailedError';
          testCoverageError.inner = error;
          callback(testCoverageError);
        } else {
          const testRunError = new Error('Test run failed. See output for details.');
          testRunError.name = 'TsBuildToolsTestRunOrCoverageCheckFailedError';
          testRunError.inner = error;
          callback(testRunError);
        }
      } else {
        callback(error);
      }
      return;
    }

    callback();
  }

  function onCleanTestDone(error) {
    if (error) {
      callback(error);
      return;
    }

    // http://rundef.com/typescript-code-coverage-istanbul-nyc
    const cliCommand = which.sync('nyc');
    const cliArgs = [
      '--require',
      '${TOOLS_DIR}/src/mocha-ts-node-register.js',
      '--extension=.ts',
      '--extension=.tsx',
      '--extension=.js',
      '--extension=.jsx',
      '--include=src/**',
      '--include=test/**',
      '--exclude=**/*.d.ts',
      '--all',
    ]
      .concat(!shouldFailOnCoverageCheck ? [] : ['--check-coverage', '--lines', String(coverageCheckLinesThreshold)])
      .concat([
        '--reporter=lcov',
        '--reporter=text-summary',
        '--reporter=text',
        which.sync('mocha'),
        '--exit', // https://github.com/istanbuljs/nyc/issues/688#issuecomment-338880265
        '-t',
        String(testsTimeout),
        '${PROJECT_DIR}/test/test.ts',
      ]);

    spawn(cliCommand, cliArgs, {}, onTestDone);
  }

  function onStart() {
    remove({
      paths: ['${PROJECT_DIR}/.nyc_output', '${PROJECT_DIR}/coverage'],
      callback: onCleanTestDone,
      cli: options.cli,
      logPrefix: options.logPrefix,
    });
  }

  onStart();
};
