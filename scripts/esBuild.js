// build.js
import { write } from "bun";
import * as esbuild from "esbuild";
import { config, timestamp, publicPath } from "./config";

const measureTime = async (operation, action) => {
  const startTime = performance.now();
  const result = await action();
  const endTime = performance.now();
  console.log(`${operation} 耗时 ${(endTime - startTime).toFixed(2)} 毫秒`);
  return result;
};

const getEntryFiles = (metaData) => {
  const entryFiles = { js: "", css: "" };

  Object.entries(metaData.outputs).forEach(([path, output]) => {
    if (path.includes("entry") || path.match(/entry[-_\w]*\.(js|css)$/)) {
      if (path.endsWith(".js")) {
        // 保留完整路径，但去掉 public/ 前缀
        entryFiles.js = path.replace(/^public\//, "");
      } else if (path.endsWith(".css")) {
        entryFiles.css = path.replace(/^public\//, "");
      }
    }
  });

  return entryFiles;
};

export const runMetaBuild = async () => {
  const totalStartTime = performance.now();

  const result = await measureTime("esbuild 构建", () => esbuild.build(config));

  // 保留原有的 meta.json 写入
  await measureTime("写入 meta.json", () =>
    write("public/meta.json", JSON.stringify(result.metafile))
  );

  const assets = getEntryFiles(result.metafile);

  // 简化的资源信息，但保留时间戳版本管理
  const buildInfo = {
    // 资源基础路径
    basePath: publicPath, // 如: "/assets/" 或 "/assets-1703123456789/"

    // 入口文件（相对于 public/ 目录）
    js: assets.js, // 如: "assets-1703123456789/entry-abc123.js"
    css: assets.css, // 如: "assets-1703123456789/entry-def456.css"

    // 版本信息
    timestamp,
    buildTime: new Date().toISOString(),
  };

  // 保留原有的文件写入逻辑
  await measureTime("写入 latest-assets.json", () =>
    write("public/latest-assets.json", JSON.stringify(buildInfo))
  );

  const totalEndTime = performance.now();
  console.log(`总耗时 ${(totalEndTime - totalStartTime).toFixed(2)} 毫秒`);
  console.log("构建信息:", buildInfo);
};

runMetaBuild();
