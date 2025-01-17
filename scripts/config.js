import postCssPlugin from "esbuild-style-plugin";
import { isProduction } from "utils/env";
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
  plugins: [
    postCssPlugin({
      postcss: {
        plugins: [require("tailwindcss")],
      },
    }),
  ],
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
const prodConfig = {
  entryNames: "[dir]/[name]-[hash]",
  minify: true,
  sourcemap: false,
  drop: ['console', 'debugger'],
};

export const config = isProduction
  ? { ...commonConfig, ...prodConfig }
  : commonConfig;

// 可选的构建验证
export const validateBuild = async (result) => {
  if (result.metafile) {
    const outputs = Object.keys(result.metafile.outputs);
    const hasRNCode = outputs.some(file => 
      file.includes('react-native') || file.includes('/rn/')
    );
    
    if (hasRNCode) {
      console.warn('Warning: Build contains React Native code!');
    }
  }
};
