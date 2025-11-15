// esbuild.config.js
import { isProduction } from "../packages/utils/env.ts";

const inputPath = "./packages/web/entry.tsx";
export const timestamp = Date.now().toString();
export const publicPath = isProduction
  ? `/public/assets-${timestamp}/`
  : "/assets/";
const outdir = isProduction ? `public/assets-${timestamp}` : "public/assets";

export const config = {
  entryPoints: [inputPath],
  outdir,
  publicPath,
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "browser",
  treeShaking: true,
  metafile: true,
  sourcemap: !isProduction,
  minify: isProduction,
  target: ["es2020"],
  define: {
    "process.env.PLATFORM": JSON.stringify("web"),
    "process.env.NODE_ENV": JSON.stringify(
      isProduction ? "production" : "development"
    ),
  },
  loader: {
    ".js": "jsx",
    ".webp": "file",
    ".jpg": "file",
    ".png": "file",
    ".svg": "text",
  },
  resolveExtensions: [".tsx", ".ts", ".jsx", ".js"],
  conditions: ["browser", "default"],

  // 核心修复：chunks 必须带 hash，否则 splitting 会导致命名冲突
  entryNames: isProduction ? "[name]-[hash]" : "[name]",
  chunkNames: "chunks/[name]-[hash]", // ✅ 始终带 hash
  assetNames: isProduction ? "assets/[name]-[hash]" : "assets/[name]",

  external: ["react-native*"],
};
