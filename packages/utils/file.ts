import fs from "fs";
import readline from "readline";
import { getLogger } from "utils/logger";
import { createWriteStream, createReadStream } from "node:fs";
import { formatData, extractAndDecodePrefix } from "core";

import { pipeline, Readable } from "stream";
import { promisify } from "util";
import { processLine } from "core/decodeData";
import { readLines } from "utils/bun/readLines"; // Ensure this points to the location of your readLines function
import { unlink } from "node:fs/promises";

const pipelineAsync = promisify(pipeline);

const readDataLogger = getLogger("readData");

export const checkFileExists = (filePath) => {
  return fs.existsSync(filePath);
};
export const findDataInFile = (filePath, id) => {
  return new Promise((resolve, reject) => {
    let found = false;

    const input = createReadStream(filePath);

    input.on("error", (err) => reject(err));

    const rl = readline.createInterface({ input });

    rl.on("line", (line) => {
      readDataLogger.info({ line }, "line");
      const [key, value] = processLine(line);
      readDataLogger.info({ key, value }, "processLine");
      if (id === key) {
        readDataLogger.info({ id, value }, "result");
        found = true;
        resolve(value);
        rl.close();
      }
    });

    rl.on("close", () => {
      if (!found) {
        readDataLogger.info({ id }, "id not found");
        resolve(null);
      }
    });

    rl.on("error", (err) => reject(err));
  });
};

export async function appendDataToFile(
  path: string,
  dataKey: string,
  data: string,
): Promise<void> {
  const output = createWriteStream(path, { flags: "a" });
  await pipelineAsync(Readable.from(`${dataKey} ${data}\n`), output);
}

export async function appendDataToIndex(
  userId: string,
  dataKey: string,
  data: string,
): Promise<void> {
  const path = `./nolodata/${userId}/index.nolo`;
  const output = createWriteStream(path, { flags: "a" });
  await pipelineAsync(Readable.from(`${dataKey} ${data}\n`), output);
}
export const updateDataInFile = async (filePath, id, value) => {
  const tempFilePath = `${filePath}.tmp`;
  const writer = Bun.file(tempFilePath).writer();

  let updated = false;
  try {
    const fileStream = Bun.file(filePath).stream();
    for await (const line of readLines(fileStream)) {
      if (line.startsWith(id)) {
        await writer.write(`${id} ${value}\n`);
        updated = true;
      } else {
        await writer.write(`${line}\n`);
      }
    }

    await writer.end();

    if (updated) {
      await unlink(filePath);
      await Bun.write(filePath, Bun.file(tempFilePath));
      await unlink(tempFilePath);
    } else {
      await unlink(tempFilePath);
      throw new Error("Data not found");
    }
  } catch (error) {
    await unlink(tempFilePath);
    throw error;
  }
};

export const deleteFromFile = async (filePath: string, id: string) => {
  const fileContent = await fs.promises.readFile(filePath, "utf-8");
  const lines = fileContent.split("\n");
  const newLines = lines.filter((line) => !line.startsWith(id));
  await fs.promises.writeFile(filePath, newLines.join("\n"));
  console.log("Data deleted successfully.");
};
