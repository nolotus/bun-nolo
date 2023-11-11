import * as esbuild from 'esbuild';

import {config} from './config';

let ctx = await esbuild.context(config);
await ctx.watch();

let { host, port } = await ctx.serve({
  servedir: 'public',
});


// console.log(await esbuild.analyzeMetafile(result.metafile));
