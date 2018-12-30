# `ts-build-tools`

A command-line toolkit to manage a Node.js package written in TypeScript.

Includes build, clean, lint, test, dev, and prepublish scripts out-of-the box.

Intended to work with [`zmey-gorynych`](https://www.npmjs.com/package/zmey-gorynych), a Node.js package versioning and publishing tool.

## Usage

Initialize a new Node.js package and install the toolkit with [`npm`](https://docs.npmjs.com/cli/init):

```
cd your-package
npm init -y
npm i -D @sompylasar/ts-build-tools
```

or with [`yarn`](https://yarnpkg.com/lang/en/docs/cli/init/):

```
cd your-package
yarn init -y
yarn add --dev @sompylasar/ts-build-tools
```

## Commands

### `init`

Scaffold the package file structure and update the `package.json` to include the necessary file references, dependencies, and scripts.

### `build`

Produce JavaScript in the `lib` directory via `tsc`.

### `clean`

Removes the `lib` and `coverage` directories.

### `lint`

Runs `tslint`.

### `test`

Run the tests via `nyc`, `mocha`, and `ts-node`.

### `dev`

Run the application in the source code watch and hot reload mode via `tsc --watch`.

## Known limitations

- The toolkit in some aspects relies on the `node_modules` structure, so it may not work with `node_modules`-less setups like Yarn PnP and NPM Tink.
