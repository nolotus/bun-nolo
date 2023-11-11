import * as esbuild from 'esbuild';

import { config } from './config';

// console.log(await esbuild.analyzeMetafile(result.metafile));
export const runBuild = async () => {
  await esbuild.build(config);
};
runBuild();
