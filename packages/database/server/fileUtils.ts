// fileUtils.ts

import { join } from "path";
import { extractUserId } from "core/prefix";
import { createReadStream, createWriteStream } from "node:fs";
import readline from "readline";
import { mkdir, readdir, unlink } from "node:fs/promises";

const getUserDirectory = (baseDir: string, userId: string): string => {
  return join(baseDir, userId);
};

export const retrieveValueFromFileSystem = async (
  key: string,
  baseDirectory: string,
): Promise<string | undefined> => {
  const userId = extractUserId(key);
  const userDirectory = getUserDirectory(baseDirectory, userId);
  try {
    let files = await readdir(userDirectory);
    files = files.sort((a, b) => {
      const aMatch = a.match(/layer\d+_(\d+)-(\d+)\.nolo$/);
      const bMatch = b.match(/layer\d+_(\d+)-(\d+)\.nolo$/);
      const aTime = aMatch ? parseInt(aMatch[1], 10) : 0;
      const bTime = bMatch ? parseInt(bMatch[1], 10) : 0;
      const aSeq = aMatch ? parseInt(aMatch[2], 10) : 0;
      const bSeq = bMatch ? parseInt(bMatch[2], 10) : 0;
      if (bTime !== aTime) return bTime - aTime;
      return bSeq - aSeq;
    });

    for (const file of files) {
      const filePath = join(userDirectory, file);
      const value = await searchKeyInFile(filePath, key);
      if (value !== null) {
        return value;
      }
    }
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return undefined;
    }
    console.error("从文件读取时出错:", error);
  }

  return undefined;
};

const searchKeyInFile = (filePath: string, searchKey: string) => {
  return new Promise<string | null>((resolve, reject) => {
    let isFound = false;
    const inputStream = createReadStream(filePath);
    inputStream.on("error", (err) => reject(err));
    const rl = readline.createInterface({ input: inputStream });

    rl.on("line", (line) => {
      const index = line.indexOf(" ");
      if (index === -1) return;
      const key = line.substring(0, index);
      const value = line.substring(index + 1);
      if (searchKey === key) {
        isFound = true;
        resolve(value);
        rl.close();
      }
    });

    rl.on("close", () => {
      if (!isFound) {
        resolve(null);
      }
    });

    rl.on("error", (err) => reject(err));
  });
};

const writeKeyValueEntriesToFile = async (
  directory: string,
  entries: Array<{ key: string; value: string }>,
  layer: number,
  timestamp: number,
  sequenceNumber: number,
): Promise<void> => {
  const filePath = `${directory}/data_layer${layer}_${timestamp}-${sequenceNumber}.nolo`;
  const writeStream = createWriteStream(filePath, { flags: "w" });
  for (const entry of entries) {
    writeStream.write(`${entry.key} ${entry.value}\n`);
  }
  writeStream.end();
  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
};

const mergeLayerFiles = async (
  directory: string,
  layer: number,
): Promise<Array<{ key: string; value: string }>> => {
  const files = await readdir(directory);
  const targetFiles = files.filter((file) => file.includes(`layer${layer}_`));
  if (targetFiles.length <= 3) return [];

  let mergedEntries = new Map<string, string>();
  for (const file of targetFiles) {
    const filePath = join(directory, file);
    const fileContent = await Bun.file(filePath).text();
    fileContent
      .split("\n")
      .filter((line) => line.trim() !== "")
      .forEach((line) => {
        const index = line.indexOf(" ");
        if (index === -1) return;
        const key = line.substring(0, index);
        const value = line.substring(index + 1);
        if (key) {
          value === "0"
            ? mergedEntries.delete(key)
            : mergedEntries.set(key, value);
        }
      });
    await unlink(filePath);
  }

  return Array.from(mergedEntries.entries()).map(([key, value]) => ({
    key,
    value,
  }));
};

export const appendOrMergeLayerFiles = async (
  baseDirectory: string,
  userId: string,
  entries: Array<{ key: string; value: string }>,
  currentLayer: number,
  timestamp: number,
  sequenceNumber: number,
): Promise<void> => {
  if (!userId) {
    console.error(
      `Invalid userId: ${userId} for baseDirectory: ${baseDirectory}`,
    );
    return;
  }

  const userDir = join(baseDirectory, userId);
  await mkdir(userDir, { recursive: true });

  await writeKeyValueEntriesToFile(
    userDir,
    entries,
    currentLayer,
    timestamp,
    sequenceNumber,
  );

  const files = await readdir(userDir);
  const targetFiles = files.filter((file) =>
    file.includes(`layer${currentLayer}_`),
  );

  if (targetFiles.length > 3) {
    const mergedEntries = await mergeLayerFiles(userDir, currentLayer);
    const nextLayer = currentLayer + 1;
    await appendOrMergeLayerFiles(
      baseDirectory,
      userId,
      mergedEntries,
      nextLayer,
      timestamp,
      sequenceNumber,
    );
  }
};
