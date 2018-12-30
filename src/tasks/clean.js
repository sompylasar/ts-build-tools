const remove = require('../remove');

module.exports = function(options) {
  remove({
    paths: [
      '${PROJECT_DIR}/lib',
      '${PROJECT_DIR}/.nyc_output',
      '${PROJECT_DIR}/coverage',
      '${PROJECT_DIR}/npm-debug.log',
    ],
    callback: options.callback,
    cli: options.cli,
    logPrefix: options.logPrefix,
  });
};
