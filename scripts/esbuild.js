import { write } from 'bun';
import * as esbuild from 'esbuild';
import postCssPlugin from 'esbuild-style-plugin';
import rimraf from 'rimraf';
import { isProduction } from 'utils/env';
const inputPath = './packages/web/entry.tsx';
const config = {
  entryPoints: [inputPath],

  entryNames: '[dir]/[name]-[hash]',
  outdir: 'public',
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

// console.log(await esbuild.analyzeMetafile(result.metafile));
export const esbuildClient = async () => {
  return esbuild.context({ ...config, write: false });
};
export const updatePublicAssets = async (result) => {
  // 清空 public 目录
  rimraf.sync('./public/*');
  try {
    // 遍历所有输出文件并写入
    await Promise.all(
      result.outputFiles.map(async (file) => {
        const pathParts = file.path.split('/');
        const filename = pathParts.pop();
        const filePath = `./public/${filename}`;
        // const data = new TextDecoder().decode(file.contents);
        await write(filePath, file.contents);
      }),
    );
    const entryJsFile = result.outputFiles.find((file) => {
      const parts = file.path.split('/');
      const filename = parts.pop();
      return filename.startsWith('entry') && filename.endsWith('.js');
    });
    const entryCssFile = result.outputFiles.find((file) => {
      const parts = file.path.split('/');
      const filename = parts.pop();
      return filename.startsWith('entry') && filename.endsWith('.css');
    });
    if (entryJsFile && entryCssFile) {
      const jsFilename = entryJsFile.path.split('/').pop();
      const cssFilename = entryCssFile.path.split('/').pop();
      return { js: jsFilename, css: cssFilename }; // 返回 JavaScript 和 CSS 的文件名
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error writing files:', error);
    return null;
  }
};
