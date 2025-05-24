import { isProduction } from "../packages/utils/env";

const inputPath = "./packages/web/entry.tsx";

// 定义公共配置
export const commonConfig = {
  entryPoints: [inputPath],
  outdir: "public/assets", // 默认输出目录，可能会被覆盖
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
};

const prodConfig = {
  entryNames: "[dir]/[name]-[hash]",
  minify: true,
  sourcemap: false,
  minifyIdentifiers: false,
  target: ["es2020"],
};

// 动态生成输出目录，基于时间戳
const timestamp = Date.now().toString();
const dynamicOutdir = `public/assets-${timestamp}`;

export const config = isProduction
  ? { ...commonConfig, ...prodConfig, outdir: dynamicOutdir }
  : { ...commonConfig, outdir: "public/assets" };
