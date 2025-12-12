// esbuild.config.js
// 目标：开发 / 生产 保持几乎一致的打包行为，只保留少数必要差异

import { isProduction } from "../packages/utils/env.ts";

const INPUT_ENTRY = "./packages/web/entry.tsx";

/**
 * 统一的构建标识：
 * - 生产：每次构建生成一个新的 buildId，用于区分 public/assets-<buildId>
 * - 开发：固定为 "dev"，保证 SSR 可稳定指向 /public/assets/entry.js
 */
const buildId = isProduction ? Date.now().toString() : "dev";

/**
 * 输出目录名：
 * - 生产：public/assets-<buildId>
 * - 开发：public/assets
 */
const assetDirName = isProduction ? `assets-${buildId}` : "assets";

export const outdir = `public/${assetDirName}`;
export const publicPath = `/public/${assetDirName}/`;

/**
 * 公共（环境无关）的基础配置
 */
const baseConfig = {
  entryPoints: [INPUT_ENTRY],
  outdir,
  publicPath,

  // 始终启用打包 / 代码分割 / tree-shaking
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "browser",
  target: ["es2020"],
  treeShaking: true,

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
    ".svg": "text", // SVG 当作字符串，交给 React 组件或 innerHTML 处理
  },

  resolveExtensions: [".tsx", ".ts", ".jsx", ".js"],
  conditions: ["browser", "default"],

  // chunk 始终带 hash，方便强缓存
  chunkNames: "chunks/[name]-[hash]",

  // Web 构建中排除 RN 生态的一些依赖
  external: ["react-native*"],
};

/**
 * 环境相关的差异：集中放在这里，便于维护
 */
const envSpecificConfig = isProduction
  ? {
      // 生产：压缩、无 sourcemap（或按需调整），记录 metafile
      minify: true,
      sourcemap: false,
      metafile: true,
      entryNames: "[name]-[hash]",
      assetNames: "assets/[name]-[hash]",
    }
  : {
      minify: false,
      sourcemap: true,
      sourcesContent: false,
      metafile: false,
      entryNames: "[name]",
      // ✅ 关键：dev 也让静态资源带 hash，这样可放心强缓存
      assetNames: "assets/[name]-[hash]",
    };

/**
 * 最终导出的 ESBuild 配置
 */
export const config = {
  ...baseConfig,
  ...envSpecificConfig,
};
