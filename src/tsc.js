const which = require('npm-which')(__dirname);
const spawn = require('./spawn');

module.exports = function(options) {
  const callback = options.callback || function() {};

  function onTscDone(error) {
    if (error) {
      if (error.name === 'TsBuildToolsSpawnProcessExitedWithNonZeroCodeError' && error.code === 2) {
        const buildError = new Error('TypeScript build failed. See output for details.');
        buildError.name = 'TsBuildToolsTypeScriptBuildFailedError';
        buildError.inner = error;
        callback(buildError);
      } else {
        callback(error);
      }
      return;
    }

    callback();
  }

  spawn(which.sync('tsc'), options.tscArgs, {}, onTscDone);
};
