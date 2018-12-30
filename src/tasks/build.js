const remove = require('../remove');
const tsc = require('../tsc');
const lint = require('./lint');

module.exports = function(options) {
  const callback = options.callback || function() {};

  function onLintDone(error) {
    if (error) {
      callback(error);
      return;
    }

    tsc({
      tscArgs: ['--project', '${PROJECT_DIR}/tsconfig.json'],
      callback: callback,
    });
  }

  function onCleanBuildDone(error) {
    if (error) {
      callback(error);
      return;
    }

    lint(
      Object.assign({}, options, {
        callback: onLintDone,
      }),
    );
  }

  function onStart() {
    remove({
      paths: ['${PROJECT_DIR}/lib'],
      callback: onCleanBuildDone,
      cli: options.cli,
      logPrefix: options.logPrefix,
    });
  }

  onStart();
};
