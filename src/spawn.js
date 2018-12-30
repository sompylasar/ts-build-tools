const spawn = require('child_process').spawn;

const paths = require('./paths').paths;
const expandPaths = require('./paths').expandPaths;

module.exports = function(command, args, spawnOptions, callback) {
  const spawnOptionsWithDefaults = Object.assign(
    {
      cwd: paths.PROJECT_DIR,
      stdio: 'inherit',
    },
    spawnOptions,
  );

  try {
    const child = spawn(
      expandPaths(command),
      args.map(function(arg) {
        return expandPaths(arg);
      }),
      spawnOptionsWithDefaults,
    );

    child.on('close', function(code) {
      const error = new Error('Exited with code: ' + code);
      error.name = 'TsBuildToolsSpawnProcessExitedWithNonZeroCodeError';
      error.code = code;
      if (callback) {
        callback(code === 0 ? null : error);
      }
    });
  } catch (ex) {
    process.nextTick(function() {
      const error = new Error(ex.message + ' ' + JSON.stringify(spawnOptionsWithDefaults));
      error.name = 'TsBuildToolsSpawnFailedError';
      callback(error);
    });
  }
};
