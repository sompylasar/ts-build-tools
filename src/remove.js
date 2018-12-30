const rimraf = require('rimraf');

const expandPaths = require('./paths').expandPaths;

module.exports = function(options) {
  options = options || {};
  const callback = options.callback || function() {};
  let listIndex = 0;
  let filepath;
  function rimrafNext(error) {
    if (error) {
      if (options.cli) {
        console.log(options.logPrefix + 'Failed to remove:', filepath, error);
      }
      process.nextTick(function() {
        callback(error);
      });
      return;
    }

    if (listIndex < options.paths.length) {
      filepath = expandPaths(options.paths[listIndex++]);
      if (options.cli) {
        console.log(options.logPrefix + 'Removing:', filepath);
      }
      rimraf(filepath, options.rimrafOptions || {}, rimrafNext);
    } else {
      process.nextTick(function() {
        callback(null);
      });
    }
  }
  rimrafNext(null);
};
