import * as esbuild from "esbuild";
import autoprefixer from "autoprefixer";
import postCssPlugin from "esbuild-style-plugin";
import { serve } from "bun";
import { handleRequest } from "server/request";
let ctx = await esbuild.context({
  entryPoints: ["./packages/web/entry.tsx"],
  outdir: "public",
  plugins: [
    postCssPlugin({
      postcss: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    }),
  ],
  bundle: true,
  splitting: true,
  format: "esm",
});
await ctx.watch();

let { host, port } = await ctx.serve({
  servedir: "public",
});

Bun.serve({
  port: 80,
  hostname: "0.0.0.0",
  fetch: handleRequest,
});
