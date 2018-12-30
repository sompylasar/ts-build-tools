const expandPaths = require('./paths').expandPaths;

require('ts-node').register({
  project: expandPaths('${PROJECT_DIR}/test/tsconfig.json'),
});
