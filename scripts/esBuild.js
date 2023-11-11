import { write } from 'bun';
import * as esbuild from 'esbuild';

import { updatePublicAssets } from './actiont';
import { config } from './config';

// console.log(await esbuild.analyzeMetafile(result.metafile));
export const runBuild = async () => {
  const result = await esbuild.build({ ...config, write: false });
  const assets = await updatePublicAssets(result);
  write('./public/assets.json', JSON.stringify(assets));
};
runBuild();
