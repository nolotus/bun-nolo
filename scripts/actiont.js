import { write } from 'bun';
import rimraf from 'rimraf';

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
