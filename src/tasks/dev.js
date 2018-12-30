const tsc = require('../tsc');

module.exports = function(options) {
  const callback = options.callback || function() {};

  tsc({
    tscArgs: ['--project', '${PROJECT_DIR}/tsconfig.json', '--watch'],
    callback: callback,
  });
};
