// build.js
// 作用：使用 esbuild 打包前端资源，并生成：
// - public/meta.json：完整 metafile
// - public/latest-assets.json：给服务端 SSR 使用的入口 JS/CSS 信息

import { write } from "bun";
import * as esbuild from "esbuild";
import { config, timestamp, publicPath } from "./esbuild.config";

// -----------------------------
// 通用工具
// -----------------------------

/**
 * 计时执行一个异步任务，并输出耗时日志
 */
const measureTime = async (label, action) => {
  const start = performance.now();
  const result = await action();
  const end = performance.now();
  console.log(`${label} 耗时 ${(end - start).toFixed(2)} 毫秒`);
  return result;
};

/**
 * 从 esbuild metafile 中提取入口 JS/CSS 文件
 * 要求输出文件名中包含 entry，例如：
 * - public/assets-xxx/entry-xxx.js
 * - public/assets-xxx/entry-xxx.css
 */
const getEntryFiles = (metafile) => {
  const entryFiles = { js: "", css: "" };

  if (!metafile || !metafile.outputs) {
    console.warn("metafile.outputs 为空，未能找到 entry 文件");
    return entryFiles;
  }

  Object.entries(metafile.outputs).forEach(([path]) => {
    // 只关心包含 entry 的输出文件
    if (!path.includes("entry") && !path.match(/entry[-_\w]*\.(js|css)$/)) {
      return;
    }

    if (path.endsWith(".js")) {
      // 示例：public/assets-xxx/entry-xxx.js → /public/assets-xxx/entry-xxx.js
      entryFiles.js = "/" + path;
    } else if (path.endsWith(".css")) {
      entryFiles.css = "/" + path;
    }
  });

  if (!entryFiles.js || !entryFiles.css) {
    console.warn(
      "未能在 metafile 中找到完整的 entry js/css，请检查 esbuild.output 配置"
    );
  }

  return entryFiles;
};

// -----------------------------
// 主构建流程
// -----------------------------

export const runMetaBuild = async () => {
  const totalStart = performance.now();

  // 1. 执行 esbuild 构建
  const result = await measureTime("esbuild 构建", () => esbuild.build(config));

  if (!result.metafile) {
    console.error(
      "esbuild 结果中缺少 metafile，请在 config 中设置 metafile: true"
    );
    return;
  }

  // 2. 写入完整 metafile
  await measureTime("写入 meta.json", () =>
    write("public/meta.json", JSON.stringify(result.metafile, null, 2))
  );

  // 3. 从 metafile 中提取入口 JS / CSS
  const assets = getEntryFiles(result.metafile);

  const buildInfo = {
    // 资源基础路径（与服务端路由匹配）
    basePath: publicPath,

    // 入口文件的完整 URL 路径（供服务端注入 <script>/<link>）
    js: assets.js, // 例: "/public/assets-1703123456789/entry-abc123.js"
    css: assets.css, // 例: "/public/assets-1703123456789/entry-def456.css"

    // 版本 / 构建信息
    timestamp,
    buildTime: new Date().toISOString(),
  };

  // 4. 写入 latest-assets.json，供 SSR 读取
  await measureTime("写入 latest-assets.json", () =>
    write("public/latest-assets.json", JSON.stringify(buildInfo, null, 2))
  );

  const totalEnd = performance.now();
  console.log(`总耗时 ${(totalEnd - totalStart).toFixed(2)} 毫秒`);
  console.log("构建信息:", buildInfo);
};

// 直接执行构建
runMetaBuild();
