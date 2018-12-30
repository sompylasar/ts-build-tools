const path = require('path');
const fs = require('fs');

const paths = {
  TOOLS_DIR: path.resolve(__dirname, '../'),
  PROJECT_DIR: process.cwd(),
  GIT_ROOT_DIR: null,
};

function isDirectory(dirname) {
  try {
    return fs.statSync(dirname).isDirectory();
  } catch (ex) {
    return false;
  }
}

function findGitRootDir() {
  let gitRootDir = paths.PROJECT_DIR;
  try {
    while (gitRootDir !== '/' && !isDirectory(path.join(gitRootDir, '.git'))) {
      gitRootDir = path.dirname(gitRootDir);
    }
    if (gitRootDir !== '/') {
      paths.GIT_ROOT_DIR = gitRootDir;
    } else {
      paths.GIT_ROOT_DIR = null;
    }
  } catch (ex) {
    paths.GIT_ROOT_DIR = null;
  }
}

function findPackageName() {
  try {
    const packageJsonPath = path.resolve(paths.PROJECT_DIR, './package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    module.exports.packageName = packageJson.name;
  } catch (ex) {
    module.exports.packageName = path.basename(paths.PROJECT_DIR);
  }
}

function updateComputed() {
  findGitRootDir();
  findPackageName();
}

module.exports.paths = paths;
module.exports.packageName = '';
updateComputed();

module.exports.overridePaths = function(pathsOverrides) {
  Object.assign(paths, pathsOverrides);
  updateComputed();
};

module.exports.expandPaths = function(str) {
  return str.replace(/\$\{([^}]+?)\}/, function(m, variableName) {
    return paths[variableName] || '';
  });
};
