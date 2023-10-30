import * as esbuild from 'esbuild';
import postCssPlugin from 'esbuild-style-plugin';

let ctx = await esbuild.context({
  entryPoints: ['./packages/web/entry.tsx'],
  outdir: 'public',
  plugins: [
    postCssPlugin({
      postcss: {
        plugins: [require('tailwindcss'), require('autoprefixer')],
      },
    }),
  ],
  bundle: true,
  splitting: true,
  format: 'esm',
});
await ctx.watch();

let { host, port } = await ctx.serve({
  servedir: 'public',
});
