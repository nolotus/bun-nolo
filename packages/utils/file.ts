import fs from "fs";
import { createWriteStream } from "node:fs";

import { pipeline, Readable } from "stream";
import { promisify } from "util";
import { readLines } from "utils/bun/readLines";
import { unlink } from "node:fs/promises";

const pipelineAsync = promisify(pipeline);

export const checkFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

export async function appendDataToFile(
  path: string,
  dataKey: string,
  data: string,
): Promise<void> {
  const output = createWriteStream(path, { flags: "a" });
  await pipelineAsync(Readable.from(`${dataKey} ${data}\n`), output);
}

//通用写入文件函数
//考虑文件很大的情况，内存小于文件大小
export const updateDataInFile = async (filePath, id: string, value: string) => {
  const tempFilePath = `${filePath}.tmp`;
  const readStream = Bun.file(filePath).stream();
  const tempWriter = Bun.file(tempFilePath).writer();

  let updated = false;
  try {
    for await (const line of readLines(readStream)) {
      if (line.startsWith(id)) {
        await tempWriter.write(`${id} ${value}\n`);
        updated = true;
      } else {
        await tempWriter.write(`${line}\n`);
      }
    }
    await tempWriter.end();
    if (updated) {
      await Bun.write(filePath, Bun.file(tempFilePath));
      if (tempFilePath) {
        await unlink(tempFilePath);
      }
    } else {
      await unlink(tempFilePath);
      throw new Error("Data not found");
    }
  } catch (error) {
    await unlink(tempFilePath);
    throw error;
  }
};
