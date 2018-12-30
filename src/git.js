const which = require('npm-which')(__dirname);
const spawn = require('./spawn');

module.exports = function(options) {
  const callback = options.callback || function() {};

  function onGitDone(error) {
    if (error) {
      if (error.name === 'TsBuildToolsSpawnProcessExitedWithNonZeroCodeError') {
        const gitError = new Error(
          'Git ' +
            options.gitArgs
              .map(function(arg) {
                return JSON.stringify(arg);
              })
              .join(' ') +
            ' failed with error code ' +
            error.code +
            '. See output for details.',
        );
        gitError.name = 'TsBuildToolsGitFailedError';
        gitError.inner = error;
        callback(gitError);
      } else {
        callback(error);
      }
      return;
    }

    callback();
  }

  spawn(which.sync('git'), options.gitArgs, {}, onGitDone);
};
