import { unlink, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { readLines } from "utils/bun/readLines";
import { Mutex } from "async-mutex";

const fileLocks = new Map();

const getFileLock = (filePath) => {
  if (!fileLocks.has(filePath)) {
    fileLocks.set(filePath, new Mutex());
  }
  return fileLocks.get(filePath);
};

const removeDataFromFile = async (filePath, ids) => {
  const lock = getFileLock(filePath);
  await lock.runExclusive(async () => {
    if (!existsSync(filePath)) {
      console.log(`File ${filePath} does not exist. Skipping deletion.`);
      return;
    }

    const tempFilePath = `${filePath}.tmp`;
    const readStream = Bun.file(filePath).stream();
    const tempWriter = Bun.file(tempFilePath).writer();

    try {
      for await (const line of readLines(readStream)) {
        if (line.trim() === "") {
          continue;
        }
        const lineId = line.split(" ")[0];
        if (!ids.includes(lineId)) {
          await tempWriter.write(`${line}\n`);
        }
      }
      await tempWriter.end();
      await Bun.write(filePath, Bun.file(tempFilePath));
      await unlink(tempFilePath);
    } catch (error) {
      if (existsSync(tempFilePath)) {
        await unlink(tempFilePath);
      }
      throw error;
    }
  });
};

export const processOldDeletion = async (userId, idsToDelete) => {
  const userDataDir = `./nolodata/${userId}`;
  const indexPath = `${userDataDir}/index.nolo`;

  try {
    await mkdir(userDataDir, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }

  await removeDataFromFile(indexPath, idsToDelete);

  console.log(
    `Successfully deleted ${idsToDelete.length} items for user ${userId}`,
  );
};
