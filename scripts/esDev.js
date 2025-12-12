import * as esbuild from "esbuild";
import { config } from "./esbuild.config.js";
import { writeFile } from "node:fs/promises";

console.log("启动 esbuild watch（dev 模式）...");

const DEV_RELOAD_FILE = "public/.dev-reload-version";

const devReloadPlugin = {
  name: "dev-reload-file-signal",
  setup(build) {
    let lastBuildStart = 0;

    build.onStart(() => {
      lastBuildStart = Date.now();
      console.log("⏱️ esbuild 重建开始...");
    });

    build.onEnd(async (result) => {
      const buildMs = Date.now() - lastBuildStart;

      if (result.errors?.length) {
        console.error(
          `❌ esbuild 构建失败（耗时 ${buildMs}ms），错误数量:`,
          result.errors.length
        );
        return;
      }

      console.log(`✅ esbuild 构建完成，用时 ${buildMs}ms`);

      const builtAt = Date.now();
      const info = {
        version: String(builtAt), // version 仍可用时间戳，简单直观
        builtAt,
        buildMs,
      };

      await writeFile(DEV_RELOAD_FILE, JSON.stringify(info), "utf8");
      console.log("♻️ dev-reload build info written:", info);
    });
  },
};

const devConfig = {
  ...config,
  metafile: false,
  plugins: [...(config.plugins || []), devReloadPlugin],
};

try {
  const ctx = await esbuild.context(devConfig);
  await ctx.watch();
  console.log("👀 esbuild 正在监听源码变化（输出到 public/assets/）");
} catch (err) {
  console.error("❌ esbuild 初始化失败:", err);
  process.exit(1);
}
