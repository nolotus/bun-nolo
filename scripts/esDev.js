// import * as esbuild from 'esbuild';
// import postCssPlugin from 'esbuild-style-plugin';

// let ctx = await esbuild.context({
//   entryPoints: ['./packages/web/entry.tsx'],
//   outdir: 'public',
//   plugins: [
//     postCssPlugin({
//       postcss: {
//         plugins: [require('tailwindcss'), require('autoprefixer')],
//       },
//     }),
//   ],
//   bundle: true,
//   splitting: true,
//   format: 'esm',
// });
// await ctx.watch();

// let { host, port } = await ctx.serve({
//   servedir: 'public',
// });

import { serve } from 'bun';
import * as esbuild from 'esbuild';
import { handleRequest } from 'server/request';

import { updatePublicAssets } from './actiont';
import { config } from './config';
// console.log(await esbuild.analyzeMetafile(result.metafile));
export const esbuildClient = async () => {
  return esbuild.context({ ...config, write: false });
};

export const startServer = async () => {
  const ctx = await esbuildClient();
  const result = await ctx.rebuild();
  const assets = await updatePublicAssets(result);

  // 启动 http 服务器
  serve({
    port: 80,
    hostname: '0.0.0.0',
    fetch: (request) => handleRequest(request, assets),
  });
};
startServer();
