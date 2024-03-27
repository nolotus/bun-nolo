import { promises as fs } from "fs";
import { dirname } from "path";
import { extractAndDecodePrefix } from "core/prefix";
import { createWriteStream } from "node:fs";
import { promisify } from "util";
import { pipeline, Readable } from "stream";

const pipelineAsync = promisify(pipeline);

export const serverWrite = async (dataKey, data, userId) => {
  const path = `./nolodata/${userId}/index.nolo`;
  try {
    await fs.access(dirname(path));
  } catch {
    throw new Error("没有该用户");
  }
  const result = extractAndDecodePrefix(dataKey);
  const { isFile } = result;
  if (isFile) {
    const mimeTypes = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "application/pdf": ".pdf",
      // ...其它MIME类型及对应后缀
    };
    const fileExtension = mimeTypes[data.type] || ""; // 如果找不到对应的MIME类型, 返回空字符串作为后缀

    await Bun.write(`nolodata/${userId}/${dataKey}`, data);
  }
  const output = createWriteStream(path, { flags: "a" });
  await pipelineAsync(Readable.from(`${dataKey} ${data}\n`), output);
};
