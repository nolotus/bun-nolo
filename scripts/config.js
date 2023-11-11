import postCssPlugin from 'esbuild-style-plugin';
import { isProduction } from 'utils/env';

const inputPath = './packages/web/entry.tsx';
export const config = {
  entryPoints: [inputPath],
  outdir: 'public/assets',
  plugins: [
    postCssPlugin({
      postcss: {
        plugins: [require('tailwindcss'), require('autoprefixer')],
      },
    }),
  ],
  bundle: true,
  minify: isProduction, // 仅在生产环境中最小化代码
  sourcemap: isProduction ? false : 'external', // 仅在非生产环境中生成源代码映射
  splitting: isProduction ? true : false,
  treeShaking: true,
  format: 'esm',
  loader: {
    // 加载器配置保持不变
    '.js': 'jsx',
    '.webp': 'file',
    '.jpg': 'file',
    '.png': 'file',
    '.svg': 'text',
  },
};
