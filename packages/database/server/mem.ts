// main.ts

import fs from "fs";
import path from "path";
import { getFromMemory } from "./memoryUtils";
import { extractUserId } from "core/prefix";
import { readAllFilesForUser } from "./fileUtils";
import { findLogFiles, getLogFileLines, writeMemoryLog } from "./logUtils";

import { baseDir } from "database/server/config";
import { getHeadTail } from "core/getHeadTail";
import { writeUserFiles } from "./writeDataToFile";

type MemoryStructure = {
  memTable: Map<string, string>;
  immutableMem: Array<Map<string, string>>;
  sequenceNumber: number;
};

const createMemory = (): MemoryStructure => ({
  memTable: new Map(),
  immutableMem: [],
  sequenceNumber: 0,
});

const get = async (
  memory: MemoryStructure,
  key: string,
): Promise<string | undefined> => {
  // console.log(
  //   `Current memory.memTable:`,
  //   Array.from(memory.memTable.entries()),
  // );

  const memoryValue = getFromMemory(memory, key);

  if (memoryValue !== undefined) {
    return memoryValue;
  }

  const userId = extractUserId(key);
  const value = await readAllFilesForUser(baseDir, userId, key);
  return value;
};

const updateWalFromDefault = (
  timestamp: string,
  sequenceNumber: number,
): void => {
  const defaultLogPath = path.resolve(baseDir, "default.log");
  const walPath = path.resolve(
    baseDir,
    `wal_${timestamp}_${sequenceNumber}.log`,
  );

  if (fs.existsSync(defaultLogPath)) {
    fs.copyFileSync(defaultLogPath, walPath);
    fs.writeFileSync(defaultLogPath, "", "utf-8");
  }
};

const organizeDataByUserId = (
  memory: Map<string, string>,
): Map<string, Map<string, string>> => {
  const userData: Map<string, Map<string, string>> = new Map();

  memory.forEach((value, key) => {
    const userId = extractUserId(key);
    if (!userData.has(userId)) {
      userData.set(userId, new Map());
    }
    userData.get(userId)?.set(key, value);
  });

  return userData;
};

// 更新后的moveToImmutable函数
const moveToImmutable = (memory: MemoryStructure): MemoryStructure => {
  const timestamp = Date.now().toString();
  // console.log("moveToImmutable", memory);
  updateWalFromDefault(timestamp, memory.sequenceNumber);
  const userData = organizeDataByUserId(memory.memTable);
  writeUserFiles(userData, timestamp, memory.sequenceNumber);

  return {
    memTable: new Map(), // 清空 memTable
    immutableMem: [...memory.immutableMem, new Map(memory.memTable)],
    sequenceNumber: memory.sequenceNumber + 1,
  };
};

const set = (
  memory: MemoryStructure,
  key: string,
  value: string,
): MemoryStructure => {
  if (!memory || !memory.memTable) {
    console.error("Invalid memory structure in set function");
    return createMemory();
  }

  const newMemTable = new Map(memory.memTable);
  newMemTable.set(key, value);

  // Write to default.log
  writeMemoryLog(key, value);

  if (newMemTable.size > 2) {
    return moveToImmutable({ ...memory, memTable: newMemTable });
  }

  return { ...memory, memTable: newMemTable };
};

class EnhancedMap {
  private memory: MemoryStructure;

  constructor() {
    this.memory = createMemory();
    const logFiles = findLogFiles();
    logFiles.forEach((logFile) => {
      const lines = getLogFileLines(logFile);
      this.applyLogData(lines);
    });
  }

  private applyLogData(lines: string[]): void {
    console.log(`applyLogData: ${lines}`);

    lines.forEach((line) => {
      // console.log(`applyLogData line: ${line}`);

      try {
        const { key, value } = getHeadTail(line);

        if (key) {
          this.memory.memTable.set(key, value);

          console.log(`Newly added key: ${key}`);
          console.log(this.memory.memTable.keys());
        }
      } catch (error) {
        console.error(`Failed to parse line with error: ${error.message}`);
      }
    });
  }

  clear(): void {
    this.memory = createMemory();
  }

  async get(key: string): Promise<string | undefined> {
    return await get(this.memory, key);
  }

  getFromMemorySync(): Array<{ key: string; value: string }> {
    const finalArray: Array<{ key: string; value: string }> = [];
    const seenKeys = new Set<string>();

    // 先处理memTable
    this.memory.memTable.forEach((value, key) => {
      finalArray.push({ key, value });
      seenKeys.add(key);
    });

    // 依次处理immutableMem
    for (const map of this.memory.immutableMem.reverse()) {
      map.forEach((value, key) => {
        if (!seenKeys.has(key)) {
          finalArray.push({ key, value });
          seenKeys.add(key);
        }
      });
    }

    return finalArray;
  }

  set(key: string, value: string): this {
    console.log("set", key);
    this.memory = set(this.memory, key, value);
    return this;
  }
}

export const mem = new EnhancedMap();
