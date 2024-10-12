// mem.ts

import { getHeadTail, parseStrWithId } from "core/decodeData";
import { extractUserId } from "core/prefix";
import { mkdir, readdir, readFile, unlink } from "node:fs/promises";
import { join } from "path";

const log = (
  message: string,
  startTime: number,
  startMemory: NodeJS.MemoryUsage,
) => {
  const endTime = performance.now();
  const endMemory = process.memoryUsage();
  console.log(
    `${message} - Time: ${(endTime - startTime).toFixed(2)}ms, Memory: RSS ${((endMemory.rss - startMemory.rss) / 1024 / 1024).toFixed(2)}MB, Heap ${((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`,
  );
};

type MemoryStructure = {
  directMem: Map<string, string>;
  immutableMem: Array<Map<string, string>>;
};

const createMemory = (): MemoryStructure => ({
  directMem: new Map(),
  immutableMem: [],
});

const get = (memory: MemoryStructure, key: string): string | undefined => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  if (!memory || !memory.directMem) {
    console.error("Invalid memory structure in get function");
    log(`Get (error): ${key}`, startTime, startMemory);
    return undefined;
  }

  const directValue = memory.directMem.get(key);
  if (directValue !== undefined) {
    log(`Get from directMem: ${key}`, startTime, startMemory);
    return directValue;
  }

  for (let i = memory.immutableMem.length - 1; i >= 0; i--) {
    const value = memory.immutableMem[i].get(key);
    if (value !== undefined) {
      log(`Get from immutableMem[${i}]: ${key}`, startTime, startMemory);
      return value;
    }
  }

  log(`Get (not found): ${key}`, startTime, startMemory);
  return undefined;
};

const set = (
  memory: MemoryStructure,
  key: string,
  value: string,
): MemoryStructure => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  if (!memory || !memory.directMem) {
    console.error("Invalid memory structure in set function");
    log(`Set (error): ${key}`, startTime, startMemory);
    return createMemory();
  }

  const newDirectMem = new Map(memory.directMem);
  newDirectMem.set(key, value);

  if (newDirectMem.size > 3) {
    const result = {
      directMem: new Map(),
      immutableMem: [...memory.immutableMem, newDirectMem],
    };
    log(`Set (new immutableMem): ${key}`, startTime, startMemory);
    return result;
  }

  const result = { ...memory, directMem: newDirectMem };
  log(`Set: ${key}`, startTime, startMemory);
  return result;
};

const writeImmutableMemToFile = async (
  immutableMem: Array<Map<string, string>>,
): Promise<boolean> => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  try {
    const data = immutableMem.flatMap((m) => Array.from(m.entries()));
    const groupedData = new Map<string, string[]>();

    for (const [key, value] of data) {
      if (value === "0") continue; // 跳过已删除的数据
      const userId = extractUserId(key);
      if (!userId) continue;

      if (!groupedData.has(userId)) {
        groupedData.set(userId, []);
      }
      groupedData.get(userId)!.push(`${key} ${value}`);
    }

    for (const [userId, userLines] of groupedData) {
      const dirPath = join("nolodata", userId);
      await mkdir(dirPath, { recursive: true });

      const filePath = join(dirPath, `immutableMem_${Date.now()}.nolo`);
      await Bun.write(filePath, userLines.join("\n"));

      // 检查并可能合并文件
      await checkAndMergeFiles(dirPath);
    }

    console.log("ImmutableMem has been written to files");
    log("WriteImmutableMemToFile", startTime, startMemory);
    return true;
  } catch (error) {
    console.error("Error writing immutableMem to files:", error);
    log("WriteImmutableMemToFile (error)", startTime, startMemory);
    return false;
  }
};

const checkAndMergeFiles = async (dirPath: string): Promise<void> => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  try {
    const files = await readdir(dirPath);
    const immutableMemFiles = files.filter(
      (f) => f.startsWith("immutableMem_") && f.endsWith(".nolo"),
    );

    if (immutableMemFiles.length > 3) {
      // 读取所有文件内容
      const allContent = new Map<string, string>();
      for (const file of immutableMemFiles) {
        const content = await readFile(join(dirPath, file), "utf-8");
        const lines = content.split("\n");
        for (const line of lines) {
          const { key, value } = getHeadTail(line, " ");
          if (value !== "0") {
            // 不保存已删除的数据
            allContent.set(key, value);
          }
        }
      }

      // 写入合并后的文件
      const mergedFilePath = join(
        dirPath,
        `immutableMem_merged_${Date.now()}.nolo`,
      );
      const mergedContent = Array.from(allContent.entries())
        .map(([k, v]) => `${k} ${v}`)
        .join("\n");
      await Bun.write(mergedFilePath, mergedContent);

      // 删除原文件
      for (const file of immutableMemFiles) {
        await unlink(join(dirPath, file));
      }

      console.log(
        `Merged ${immutableMemFiles.length} files into ${mergedFilePath}`,
      );
    }

    log("CheckAndMergeFiles", startTime, startMemory);
  } catch (error) {
    console.error("Error checking and merging files:", error);
    log("CheckAndMergeFiles (error)", startTime, startMemory);
  }
};

const checkAndTriggerWrite = async (
  memory: MemoryStructure,
): Promise<MemoryStructure> => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  if (!memory || !memory.immutableMem) {
    console.error("Invalid memory structure in checkAndTriggerWrite function");
    log("CheckAndTriggerWrite (error)", startTime, startMemory);
    return createMemory();
  }

  if (memory.immutableMem.length >= 3) {
    const memToWrite = memory.immutableMem.slice(0, 3);

    try {
      const writeSuccess = await writeImmutableMemToFile(memToWrite);
      if (writeSuccess) {
        // 只清除已写入的数据
        memory.immutableMem = memory.immutableMem.slice(3);
        log("CheckAndTriggerWrite (success)", startTime, startMemory);
      } else {
        log("CheckAndTriggerWrite (failure)", startTime, startMemory);
      }
    } catch (error) {
      console.error(error);
      log("CheckAndTriggerWrite (error)", startTime, startMemory);
    }
  } else {
    log("CheckAndTriggerWrite (no write needed)", startTime, startMemory);
  }

  return memory;
};

const prepareForFileWrite = (
  memory: MemoryStructure,
): Map<string, string[]> => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  const snapshot = new Map<string, string[]>();
  for (const mem of memory.immutableMem) {
    for (const [key, value] of mem) {
      if (value === "0") continue; // 跳过已删除的数据
      const userId = extractUserId(key);
      if (!userId) continue;

      if (!snapshot.has(userId)) {
        snapshot.set(userId, []);
      }
      snapshot.get(userId)!.push(`${key} ${value}`);
    }
  }
  log("PrepareForFileWrite", startTime, startMemory);
  return snapshot;
};

class EnhancedMap {
  private memory: MemoryStructure;

  constructor() {
    this.memory = createMemory();
  }

  clear(): void {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    this.memory = createMemory();
    log("EnhancedMap.clear", startTime, startMemory);
  }

  get(key: string): string | undefined {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    const result = get(this.memory, key);
    log(`EnhancedMap.get: ${key}`, startTime, startMemory);
    return result;
  }

  async set(key: string, value: string): Promise<this> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    this.memory = set(this.memory, key, value);
    this.memory = await checkAndTriggerWrite(this.memory);
    log(`EnhancedMap.set: ${key}`, startTime, startMemory);
    return this;
  }

  prepareForFileWrite(): Map<string, string[]> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    const result = prepareForFileWrite(this.memory);
    log("EnhancedMap.prepareForFileWrite", startTime, startMemory);
    return result;
  }

  // 这个方法现在不再被使用，但我们保留它以防将来需要
  clearImmutableMem(): void {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    this.memory.immutableMem = [];
    log("EnhancedMap.clearImmutableMem", startTime, startMemory);
  }
}

export const mem = new EnhancedMap();

export const checkMemoryForData = (id: string) => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  const memValue = mem.get(id);
  if (memValue === "0") {
    log(`checkMemoryForData (deleted): ${id}`, startTime, startMemory);
    return null; // 视为已删除
  }
  if (memValue) {
    const result = parseStrWithId(id, memValue);
    log(`checkMemoryForData (found): ${id}`, startTime, startMemory);
    return result;
  }
  log(`checkMemoryForData (not found): ${id}`, startTime, startMemory);
  return undefined; // 表示内存中没有找到数据
};
