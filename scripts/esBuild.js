import { write } from "bun";
import * as esbuild from "esbuild";

import { config } from "./config";

const measureTime = async (operation, action) => {
  const startTime = performance.now();
  const result = await action();
  const endTime = performance.now();
  console.log(`${operation} 耗时 ${(endTime - startTime).toFixed(2)} 毫秒`);
  return result;
};

const getEntryFiles = (metaData) => {
  const entryFiles = { js: "", css: "" };
  // 调整路径匹配逻辑，确保与实际输出路径一致
  Object.entries(metaData.outputs).forEach(([path, output]) => {
    // 移除硬编码的路径前缀，改为更灵活的匹配方式
    if (path.includes("entry") || path.match(/entry[-_\w]*\.(js|css)$/)) {
      if (path.endsWith(".js")) {
        entryFiles.js = path;
      } else if (path.endsWith(".css")) {
        entryFiles.css = path;
      }
    }
  });
  return entryFiles;
};

export const runMetaBuild = async () => {
  const totalStartTime = performance.now();

  const result = await measureTime("esbuild 构建", () => esbuild.build(config));

  await measureTime("写入 meta.json", () =>
    write("public/meta.json", JSON.stringify(result.metafile))
  );
  const assets = getEntryFiles(result.metafile);
  // 直接将最新的入口文件信息写入到固定文件，避免二次查找
  await measureTime("写入 latest-assets.json", () =>
    write("public/latest-assets.json", JSON.stringify(assets))
  );

  const totalEndTime = performance.now();
  console.log(`总耗时 ${(totalEndTime - totalStartTime).toFixed(2)} 毫秒`);
};

runMetaBuild();
