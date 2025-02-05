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
  Object.entries(metaData.outputs).forEach(([path, output]) => {
    if (path.startsWith("public/assets/entry")) {
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
    write("public/meta.json", JSON.stringify(result.metafile)),
  );
  const assets = getEntryFiles(result.metafile);
  await measureTime("写入 assets.json", () =>
    write("public/assets.json", JSON.stringify(assets)),
  );

  const totalEndTime = performance.now();
  console.log(`总耗时 ${(totalEndTime - totalStartTime).toFixed(2)} 毫秒`);
};

runMetaBuild();
