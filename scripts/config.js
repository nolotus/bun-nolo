// config.js
import { isProduction } from "../packages/utils/env";

const inputPath = "./packages/web/entry.tsx";

// 动态生成时间戳目录（保留版本管理）
const timestamp = Date.now().toString();
const dynamicOutdir = `public/assets-${timestamp}`;
const publicPath = isProduction
  ? `public/assets-${timestamp}/`
  : "public/assets/";

export const commonConfig = {
  entryPoints: [inputPath],
  outdir: isProduction ? dynamicOutdir : "public/assets", // 保留时间戳目录生成
  define: {
    "process.env.PLATFORM": JSON.stringify("web"),
    "process.env.NODE_ENV": JSON.stringify(
      isProduction ? "production" : "development"
    ),
  },
  bundle: true,
  splitting: true,
  treeShaking: true,
  format: "esm",
  loader: {
    ".js": "jsx",
    ".webp": "file",
    ".jpg": "file",
    ".png": "file",
    ".svg": "text",
  },
  metafile: true,
  sourcemap: true,
  platform: "browser",
  external: ["react-native*"],
  resolveExtensions: [".tsx", ".ts", ".jsx", ".js"],
  conditions: ["browser", "default"],
  publicPath, // 关键：这确保所有资源都有正确的路径前缀
  assetNames: "[name]-[hash]",
  entryNames: "[name]-[hash]",
};

const prodConfig = {
  minify: true,
  sourcemap: false,
  target: ["es2020"],
};

export const config = isProduction
  ? { ...commonConfig, ...prodConfig }
  : commonConfig;

// 导出时间戳和路径信息供其他文件使用
export { timestamp, publicPath };
