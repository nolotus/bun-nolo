import { promises as fs } from "fs";
import { dirname } from "path";
import { extractAndDecodePrefix, extractUserId } from "core/prefix";
import { appendDataToIndex } from "utils/file";
// export const serverWrite = async (dataKey, data, userId) => {
//   const path = `./nolodata/${userId}/index.nolo`;
//   try {
//     await fs.access(dirname(path));
//   } catch {
//     throw new Error("没有该用户");
//   }
//   const result = extractAndDecodePrefix(dataKey);
//   const { isFile } = result;
//   if (isFile) {
//     const mimeTypes = {
//       "image/jpeg": ".jpg",
//       "image/png": ".png",
//       "application/pdf": ".pdf",
//       // ...其它MIME类型及对应后缀
//     };
//     const fileExtension = mimeTypes[data.type] || ""; // 如果找不到对应的MIME类型, 返回空字符串作为后缀

//     await Bun.write(`nolodata/${userId}/${dataKey}`, data);
//   }
//   const output = createWriteStream(path, { flags: "a" });
//   await pipelineAsync(Readable.from(`${dataKey} ${data}\n`), output);
// };

async function checkUserDirectory(userId: string): Promise<void> {
  const path = `./nolodata/${userId}/index.nolo`;
  try {
    await fs.access(dirname(path));
  } catch {
    throw new Error("没有该用户");
  }
}

async function processFile(dataKey: string, data: any): Promise<void> {
  const mimeTypes: { [key: string]: string } = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "application/pdf": ".pdf",
    //...其它MIME类型及对应后缀
  };
  const fileExtension = mimeTypes[data.type] || "";
  const userId = extractUserId(dataKey);
  await Bun.write(`nolodata/${userId}/${dataKey}${fileExtension}`, data); // 假设dataKey后也要追加fileExtension
}

function processDataKey(dataKey: string, data: any): { isFile: boolean } {
  const result = extractAndDecodePrefix(dataKey);

  // 确保isFile始终是一个boolean类型，如果是undefined则默认为false
  const isFile = result.isFile || false;

  if (isFile) {
    processFile(dataKey, data); // 保证userId被正确地传递给processFile函数
  }
  return { isFile };
}

export const serverWrite = async (
  dataKey: string,
  data: string,
  userId: string,
): Promise<void> => {
  await checkUserDirectory(userId);
  const result = processDataKey(dataKey, data);
  if (!result.isFile) {
    await appendDataToIndex(userId, dataKey, data);
  }
};
