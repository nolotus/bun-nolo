import fs from "fs";
import { createWriteStream } from "node:fs";

import { pipeline, Readable } from "stream";
import { promisify } from "util";

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
