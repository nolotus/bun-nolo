import { isProduction } from "../packages/utils/env";

const inputPath = "./packages/web/entry.tsx";

// 定义公共配置
export const commonConfig = {
  entryPoints: [inputPath],
  outdir: "public/assets",
  define: {
    'process.env.PLATFORM': JSON.stringify('web'),
    'process.env.NODE_ENV': JSON.stringify(
      isProduction ? 'production' : 'development'
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
  external: [
    'react-native',
    'react-native-*',
    './rn/*',          // 相对路径
    '/rn/*',           // 绝对路径
    'auth/rn/*',       // 特定模块路径
  ],
  resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
  conditions: ['browser', 'default'],
};

// 定义生产环境特有配置
// 定义生产环境特有配置
const prodConfig = {
  entryNames: "[dir]/[name]-[hash]",
  minify: true,
  sourcemap: false,  // 👈 只改这一行：取消注释
};

export const config = isProduction
  ? { ...commonConfig, ...prodConfig }
  : commonConfig;

