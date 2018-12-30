#!/usr/bin/env node

const script = process.argv[2];
const args = process.argv.slice(3);

require('../src/index').cli(script, args);
