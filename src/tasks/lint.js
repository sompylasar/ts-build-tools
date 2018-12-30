const which = require('npm-which')(__dirname);
const spawn = require('../spawn');

module.exports = function(options) {
  const callback = options.callback || function() {};

  spawn(
    which.sync('tslint'),
    [
      '--project',
      '${PROJECT_DIR}/tslint.json',
      // NOTE(@sompylasar): Type check within tslint doesn't work with our setup as of 2017-09-18, lots of errors, dyplicate type definitions even if TypeScript is upgraded to 2.6.0-dev.20170916.
      //'--type-check',
      '--force',
      '--format',
      'stylish',
      '${PROJECT_DIR}/src/**.ts',
      '${PROJECT_DIR}/test/**.ts',
    ],
    {},
    callback,
  );
};
