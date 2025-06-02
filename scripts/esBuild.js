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
        // 转换为服务端路由格式：public/assets-xxx/entry-hash.js → /public/assets-xxx/entry-hash.js
        entryFiles.js = "/" + path;
      } else if (path.endsWith(".css")) {
        entryFiles.css = "/" + path;
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

  const buildInfo = {
    // 资源基础路径（与服务端路由匹配）
    basePath: publicPath,

    // 入口文件的完整URL路径
    js: assets.js, // 如: "/public/assets-1703123456789/entry-abc123.js"
    css: assets.css, // 如: "/public/assets-1703123456789/entry-def456.css"

    // 版本信息
    timestamp,
    buildTime: new Date().toISOString(),
  };

  await measureTime("写入 latest-assets.json", () =>
    write("public/latest-assets.json", JSON.stringify(buildInfo))
  );

  const totalEndTime = performance.now();
  console.log(`总耗时 ${(totalEndTime - totalStartTime).toFixed(2)} 毫秒`);
  console.log("构建信息:", buildInfo);
};

runMetaBuild();
