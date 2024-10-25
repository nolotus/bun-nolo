import fs from "fs"; // 导入文件系统模块，用于文件操作
import path from "path"; // 导入路径模块，用于处理文件路径
import { getHeadTail } from "core"; // 假设该函数用于获取行的键值对
import { getSortedFilteredFiles } from "./sort"; // 导入排序和过滤文件的函数

// 单独创建一个函数来逐行读取文件
const findKeyInFile = (
  filePath: string,
  searchKey: string,
): string | undefined => {
  try {
    const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
    let remaining = "";

    return new Promise<string | undefined>((resolve, reject) => {
      fileStream.on("data", (chunk) => {
        remaining += chunk;
        let index = remaining.indexOf("\n");

        while (index > -1) {
          const line = remaining.substring(0, index).trim(); // 取得一整行
          remaining = remaining.substring(index + 1);

          if (line) {
            const { key, value } = getHeadTail(line);
            if (key === searchKey) {
              fileStream.close(); // 找到后关闭流
              resolve(value);
              return;
            }
          }
          index = remaining.indexOf("\n");
        }
      });

      fileStream.on("end", () => {
        resolve(undefined); // 未找到键返回undefined
      });

      fileStream.on("error", reject);
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}`, error);
    return undefined;
  }
};

// 读取用户目录中的所有文件并查找指定键值
export const readAllFilesForUser = async (
  baseDir: string,
  userId: string,
  key: string,
): Promise<string | undefined> => {
  const userDir = path.join(baseDir, userId);

  if (!fs.existsSync(userDir)) {
    return undefined;
  }

  try {
    const files = getSortedFilteredFiles(userDir);

    for (const file of files) {
      const filePath = path.join(userDir, file);
      const value = await findKeyInFile(filePath, key);

      if (value !== undefined) {
        return value; // 找到值后立即返回
      }
    }
  } catch (error) {
    console.error("Error reading directory for user files", error);
  }

  return undefined;
};
