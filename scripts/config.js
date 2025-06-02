// config.js
import { isProduction } from "../packages/utils/env";

const inputPath = "./packages/web/entry.tsx";

// 生成时间戳目录
const timestamp = Date.now().toString();
const dynamicOutdir = `public/assets-${timestamp}`;

// 关键：publicPath 需要与服务端路由匹配
const publicPath = isProduction
  ? `/public/assets-${timestamp}/` // 注意这里加了 /public 前缀
  : "/public/assets/"; // 开发环境也加 /public 前缀

export const commonConfig = {
  entryPoints: [inputPath],
  outdir: isProduction ? dynamicOutdir : "public/assets",
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
  publicPath, // 现在路径是 /public/assets-xxx/ 格式
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

export { timestamp, publicPath };
