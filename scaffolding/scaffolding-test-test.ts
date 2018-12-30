import { assert } from '@sompylasar/ts-build-tools';

import { main } from '../src/index';

describe(require('../package.json').name, () => {
  it('works', () => {
    assert.strictEqual(0, main(), 'main returns 0');
  });
});
