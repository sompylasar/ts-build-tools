import '@types/node';
import '@types/mocha';

import 'chai';
import 'sinon';

declare interface TsBuildToolsRunOptions {
  script: string;
  args?: string[];
  callback?: (error?: Error | null) => void;
  cli?: boolean;
  logPrefix?: string;
}

declare const run: (options: TsBuildToolsRunOptions) => void;

declare const cli: (script: string, args?: string[]) => void;

declare const chai: Chai.ChaiStatic;

declare const assert: Chai.AssertStatic;

declare const sinon: sinon.SinonStatic;
