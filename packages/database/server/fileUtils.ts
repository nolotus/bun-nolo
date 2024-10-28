import fs from "fs"; // 导入文件系统模块，用于文件操作
import path from "path"; // 导入路径模块，用于处理文件路径
import { getHeadTail } from "core"; // 假设该函数用于获取行的键值对
import { getSortedFilteredFiles } from "./sort"; // 导入排序和过滤文件的函数
import { createReadStream } from "node:fs";
import readline from "readline";

// 单独创建一个函数来逐行读取文件
const findKeyInFile = (filePath: string, id: string): string | undefined => {
  return new Promise((resolve, reject) => {
    let found = false;
    const input = createReadStream(filePath);
    input.on("error", (err) => reject(err));
    const rl = readline.createInterface({ input });
    rl.on("line", (line) => {
      const { key, value } = getHeadTail(line);
      if (id === key) {
        found = true;
        resolve(value);
        rl.close();
      }
    });

    rl.on("close", () => {
      if (!found) {
        resolve(undefined);
      }
    });

    rl.on("error", (err) => reject(err));
  });
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
      if (
        key ===
        "000000100000-VzlmQmd5S1RBUlphQS1YUnEzalk5MmVnbldoQWNLS0VkbHdQc0kzNmJlYw-01JB8PMVPRBRHQN0P88R87C2SG"
      ) {
        // console.log("file value", key, filePath, value);
      }
      if (value !== undefined) {
        return value; // 找到值后立即返回
      }
    }
  } catch (error) {
    console.error("Error reading directory for user files", error);
  }

  return undefined;
};
