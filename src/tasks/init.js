const fsExtra = require('fs-extra');
const path = require('path');

const paths = require('../paths').paths;
const git = require('../git');

module.exports = function(options) {
  const callback = options.callback || function() {};
  const projectRootPath = paths.PROJECT_DIR;
  const parentPackageJsonPath = path.join(projectRootPath, 'package.json');
  const rootTsconfigPath = path.join(projectRootPath, 'tsconfig.json');
  const rootTslintPath = path.join(projectRootPath, 'tslint.json');
  const rootPrettierrcPath = path.join(projectRootPath, '.prettierrc');
  const rootPrettierignorePath = path.join(projectRootPath, '.prettierignore');
  const srcDirPath = path.join(projectRootPath, 'src');
  const srcEntryPath = path.join(srcDirPath, 'index.ts');
  const testDirPath = path.join(projectRootPath, 'test');
  const testEntryPath = path.join(testDirPath, 'test.ts');
  const testTsconfigPath = path.join(testDirPath, 'tsconfig.json');
  const gitignorePath = path.join(projectRootPath, '.gitignore');
  const thisModulePackageJson = require('../../package.json');

  function exitWithError(message, error) {
    callback(error, message);
  }

  function exitWithSuccess(message) {
    callback(null, message);
  }

  function isFsExtraCopyAlreadyExistsError(copyError) {
    return copyError && (copyError.code === 'EEXIST' || /already exists/.test(copyError.message));
  }

  function copyFileFromScaffolding(scaffoldingFileRelativePath, projectFilePath, next) {
    const scaffoldingFilePath = require.resolve(scaffoldingFileRelativePath);
    const projectFileRelativePath = path.relative(projectRootPath, projectFilePath);
    fsExtra.copy(
      scaffoldingFilePath,
      projectFilePath,
      { overwrite: false, errorOnExist: true },
      function onTsconfigDone(copyError) {
        if (copyError && !isFsExtraCopyAlreadyExistsError(copyError)) {
          exitWithError('Failed to create file ' + projectFileRelativePath + ' in: ' + projectRootPath, copyError);
          return;
        }

        if (options.cli) {
          if (copyError) {
            console.log(
              options.logPrefix +
                'Existing file ' +
                projectFileRelativePath +
                ' not overwritten in: ' +
                projectRootPath,
            );
          } else {
            console.log(options.logPrefix + 'Created file ' + projectFileRelativePath + ' in: ' + projectRootPath);
          }
        }
        next();
      },
    );
  }

  function makeProjectDir(projectDirPath, next) {
    const projectDirRelativePath = path.relative(projectRootPath, projectDirPath);
    fsExtra.mkdirp(projectDirPath, function onTestDirCreateDone(mkdirpError) {
      if (mkdirpError && mkdirpError.code !== 'EEXIST') {
        exitWithError('Failed to create directory ' + projectDirRelativePath + ' in: ' + projectRootPath, mkdirpError);
        return;
      }

      if (options.cli) {
        console.log(options.logPrefix + 'Created directory ' + projectDirRelativePath + ' in: ' + projectRootPath);
      }
      next();
    });
  }

  function makeRootTsconfig(next) {
    copyFileFromScaffolding('../../scaffolding/scaffolding-tsconfig.json', rootTsconfigPath, next);
  }

  function makeSrcDir(next) {
    makeProjectDir(srcDirPath, next);
  }

  function makeSrcEntry(next) {
    copyFileFromScaffolding('../../scaffolding/scaffolding-index.ts', srcEntryPath, next);
  }

  function makeSrc(next) {
    makeSrcDir(function() {
      makeSrcEntry(next);
    });
  }

  function makeTestDir(next) {
    makeProjectDir(testDirPath, next);
  }

  function makeTestTsconfig(next) {
    copyFileFromScaffolding('../../scaffolding/scaffolding-test-tsconfig.json', testTsconfigPath, next);
  }

  function makeTestEntry(next) {
    copyFileFromScaffolding('../../scaffolding/scaffolding-test-test.ts', testEntryPath, next);
  }

  function makeTest(next) {
    makeTestDir(function() {
      makeTestTsconfig(function() {
        makeTestEntry(next);
      });
    });
  }

  function makeRootTslint(next) {
    copyFileFromScaffolding('../../scaffolding/scaffolding-tslint.json', rootTslintPath, next);
  }

  function makeRootPrettierrc(next) {
    copyFileFromScaffolding('../../scaffolding/scaffolding-prettierrc', rootPrettierrcPath, next);
  }

  function makeRootPrettierignore(next) {
    copyFileFromScaffolding('../../scaffolding/scaffolding-prettierignore', rootPrettierignorePath, next);
  }

  function makeGitignore(next) {
    copyFileFromScaffolding('../../scaffolding/scaffolding-gitignore', gitignorePath, next);
  }

  function cleanupBeforeInit(next) {
    require('./clean')(
      Object.assign({}, options, {
        callback: next,
      }),
    );
  }

  let parentPackageJson;

  function readParentPackageJson(next) {
    fsExtra.readFile(parentPackageJsonPath, function onProjectPackageJsonDone(
      parentPackageJsonError,
      parentPackageJsonContent,
    ) {
      if (parentPackageJsonError) {
        if (parentPackageJsonError.code === 'ENOENT') {
          exitWithSuccess('Parent package.json not found, skipping: ' + parentPackageJsonPath);
        } else {
          exitWithError('Parent package.json read error:', parentPackageJsonError);
        }
        return;
      }

      try {
        parentPackageJson = JSON.parse(String(parentPackageJsonContent));

        if (
          (parentPackageJson &&
            parentPackageJson.dependencies &&
            parentPackageJson.dependencies[thisModulePackageJson.name]) ||
          (parentPackageJson &&
            parentPackageJson.devDependencies &&
            parentPackageJson.devDependencies[thisModulePackageJson.name])
        ) {
          if (options.cli) {
            console.log(
              options.logPrefix + 'Found package.json that depends on ' + thisModulePackageJson.name + ' in:',
              projectRootPath,
            );
          }
          next();
        } else {
          exitWithSuccess('Parent package.json does not depend on ' + thisModulePackageJson.name + ', skipping.');
        }
      } catch (jsonParseError) {
        exitWithError('Parent package.json JSON.parse error:', jsonParseError);
      }
    });
  }

  function makeScriptCall(script) {
    // TODO(@sompylasar): Verify if the WORKAROUND below is still necessary.
    // WORKAROUND(@sompylasar): Cannot use `ts-build-tools` package `bin` tool directly, either not found or results in `Permission denied` error on my machine.
    //return 'node -e "require(\'' + thisModulePackageJson.name + "').cli('" + script + '\',process.argv.slice(2))"';
    return 'ts-build-tools ' + script;
  }

  function updateParentPackageJson(next) {
    // NOTE(@sompylasar): Override the default `npm init` values. The `lib` directory is ensured by the build script.
    if (!parentPackageJson.main || parentPackageJson.main.indexOf('./lib/') !== 0) {
      parentPackageJson.main = './lib/index.js';
    }
    if (!parentPackageJson.types || parentPackageJson.types.indexOf('./lib/') !== 0) {
      parentPackageJson.types = './lib/index.d.ts';
    }

    parentPackageJson.engines = Object.assign({}, parentPackageJson.engines, thisModulePackageJson.engines);

    parentPackageJson.scripts = parentPackageJson.scripts || {};
    const scripts = {
      build: makeScriptCall('build'),
      clean: makeScriptCall('clean'),
      lint: makeScriptCall('lint'),
      test: makeScriptCall('test'),
      dev: makeScriptCall('dev'),
      'clean-build-test': 'npm run --silent clean && npm run --silent build && npm run --silent test',
      prepare: 'npm run --silent clean-build-test',
      prepublish: 'check-node-version --npm ">=4" --quiet || npm run prepare',
      reinstall: 'rm -rf ./node_modules && npm install',
      start: 'node ' + parentPackageJson.main,
    };
    if (parentPackageJson.scripts.test === 'echo "Error: no test specified" && exit 1') {
      delete parentPackageJson.scripts.test;
    }
    // NOTE(@sompylasar): Loop manually, not via `Object.assign`, to keep the existing order of keys.
    Object.keys(scripts).forEach(function(scriptName) {
      if (!parentPackageJson.scripts[scriptName]) {
        parentPackageJson.scripts[scriptName] = scripts[scriptName];
      }
    });

    parentPackageJson.devDependencies = parentPackageJson.devDependencies || {};
    parentPackageJson.devDependencies[thisModulePackageJson.name] =
      parentPackageJson.devDependencies[thisModulePackageJson.name] || '^' + thisModulePackageJson.version;
    parentPackageJson.devDependencies['check-node-version'] =
      parentPackageJson.devDependencies['check-node-version'] || '^2.1.0';
    parentPackageJson.devDependencies['prettier'] =
      parentPackageJson.devDependencies['prettier'] || thisModulePackageJson.devDependencies.prettier || '^1.15.3';

    // NOTE(@sompylasar): Sort certain keys into a predefined (opinionated) order for consistency:
    const parentPackageJsonKeysOrder = [
      'private',
      'publishOptions',
      'name',
      'version',
      'description',
      'keywords',
      'author',
      'license',
      'repository',
      'main',
      'types',
      'files',
      'bin',
      'engines',
      'dependencies',
      'devDependencies',
      'peerDependencies',
      // All other keys come second.
      // The 'scripts' comes last for convenience of reading them via `cat package.json`.
    ];
    const pairs = Object.keys(parentPackageJson).map(function(key) {
      return [key, parentPackageJson[key]];
    });
    pairs.sort(function(left, right) {
      if (left[0] === right[0]) {
        return 0;
      }
      const leftIndex = parentPackageJsonKeysOrder.indexOf(left[0]);
      const rightIndex = parentPackageJsonKeysOrder.indexOf(right[0]);
      if (left[0] === 'scripts' && right[0] !== 'scripts') {
        return 1;
      } else if (left[0] !== 'scripts' && right[0] === 'scripts') {
        return -1;
      }
      if (leftIndex >= 0 && rightIndex < 0) {
        return -1;
      } else if (leftIndex < 0 && rightIndex >= 0) {
        return 1;
      } else {
        return leftIndex - rightIndex;
      }
    });
    parentPackageJson = pairs.reduce(function(accu, pair) {
      accu[pair[0]] = pair[1];
      return accu;
    }, {});

    fsExtra.writeFile(parentPackageJsonPath, JSON.stringify(parentPackageJson, null, 2) + '\n', function(
      parentPackageJsonWriteError,
    ) {
      if (parentPackageJsonWriteError) {
        exitWithError('Failed to write the updated package.json:' + parentPackageJsonPath, parentPackageJsonWriteError);
        return;
      }

      if (options.cli) {
        console.log(
          options.logPrefix +
            'Updated package.json in: ' +
            projectRootPath +
            '\n' +
            JSON.stringify(parentPackageJson, null, 2),
        );
      }
      next();
    });
  }

  function gitInit(next) {
    // Running git init in an existing repository is safe. It will not overwrite things that are already there.
    git({
      gitArgs: ['init'],
      callback: next,
    });
  }

  function gitAddAll(next) {
    git({
      gitArgs: ['add', '--all'],
      callback: next,
    });
  }

  function runSequence(sequence) {
    let fn;
    let index = 0;
    function next() {
      fn = sequence[index++];
      if (fn) {
        fn(next);
      }
    }
    next();
  }

  runSequence([
    readParentPackageJson,
    cleanupBeforeInit,
    makeGitignore,
    makeRootTsconfig,
    makeRootTslint,
    makeRootPrettierrc,
    makeRootPrettierignore,
    makeSrc,
    makeTest,
    updateParentPackageJson,
    gitInit,
    gitAddAll,
    function() {
      exitWithSuccess('Done.');
    },
  ]);
};
