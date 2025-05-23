import { isProduction } from "../packages/utils/env";

const inputPath = "./packages/web/entry.tsx";

// 定义公共配置
export const commonConfig = {
  entryPoints: [inputPath],
  outdir: "public/assets",
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
  // 修正 external 配置
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

export const config = isProduction
  ? { ...commonConfig, ...prodConfig }
  : commonConfig;
