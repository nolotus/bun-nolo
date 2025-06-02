import * as esbuild from "esbuild";
import { config } from "./esbuild.config";

console.log("🚀 启动开发服务器...");

let ctx = await esbuild.context(config);
await ctx.watch();

let { host, port } = await ctx.serve({
  servedir: "public",
});

console.log(`✅ 开发服务器运行在 http://${host}:${port}`);
console.log(`📂 静态文件目录: public/`);

// 可选：分析构建
// const result = await ctx.rebuild();
// console.log(await esbuild.analyzeMetafile(result.metafile));
