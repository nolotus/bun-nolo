import fs from "fs";
import path from "path";
import { getFromMemory } from "./memoryUtils";
import { extractUserId } from "core/prefix";
import { writeDataToFile, readAllFilesForUser } from "./fileUtils";
import { baseDir } from "./config";

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
  const memoryValue = getFromMemory(memory, key);
  if (memoryValue !== undefined) {
    return memoryValue;
  }

  const userId = extractUserId(key);
  const dataFromFiles = readAllFilesForUser(baseDir, userId);
  return dataFromFiles.get(key);
};

const writeMemoryLog = (key: string, value: string): void => {
  const logPath = path.resolve(baseDir, "default.log");
  const logEntry = `${new Date().toISOString()} - Key: ${key}, Value: ${value}\n`;
  fs.appendFileSync(logPath, logEntry, "utf-8");
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

const writeUserFiles = (
  userData: Map<string, Map<string, string>>,
  timestamp: string,
  sequenceNumber: number,
): void => {
  userData.forEach((dataMap, userId) => {
    writeDataToFile(baseDir, userId, dataMap, `${timestamp}_${sequenceNumber}`);
  });

  const walPath = path.resolve(
    baseDir,
    `wal_${timestamp}_${sequenceNumber}.log`,
  );
  if (fs.existsSync(walPath)) {
    fs.unlinkSync(walPath);
  }
};

const moveToImmutable = (memory: MemoryStructure): MemoryStructure => {
  const timestamp = Date.now().toString();

  updateWalFromDefault(timestamp, memory.sequenceNumber);
  const userData = organizeDataByUserId(memory.memTable);
  writeUserFiles(userData, timestamp, memory.sequenceNumber);

  return {
    memTable: new Map(),
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

  writeMemoryLog(key, value);

  if (newMemTable.size > 3) {
    moveToImmutable({ ...memory, memTable: newMemTable });
  }

  return { ...memory, memTable: newMemTable };
};

class EnhancedMap {
  private memory: MemoryStructure;

  constructor() {
    this.memory = createMemory();
    this.initializeFromAllLogs();
  }

  private initializeFromAllLogs(): void {
    const logFiles = fs
      .readdirSync(baseDir)
      .filter((file) => /^(wal)_\d+_\d+\.log$/.test(file))
      .sort((a, b) => {
        const [aTimestamp, aSeq] = a.match(/\d+/g) || [];
        const [bTimestamp, bSeq] = b.match(/\d+/g) || [];
        if (aTimestamp === bTimestamp) {
          return parseInt(aSeq || "0", 10) - parseInt(bSeq || "0", 10);
        }
        return (
          parseInt(aTimestamp || "0", 10) - parseInt(bTimestamp || "0", 10)
        );
      });

    logFiles.forEach((logFile) => {
      const logPath = path.join(baseDir, logFile);
      const logContent = fs.readFileSync(logPath, "utf-8");
      const lines = logContent.split("\n").filter((line) => line.trim());

      lines.forEach((line) => {
        const [key, ...valueParts] = line.split(" ");
        const value = valueParts.join(" ");
        this.memory.memTable.set(key, value);
      });

      fs.unlinkSync(logPath);
    });
  }

  clear(): void {
    this.memory = createMemory();
  }

  async get(key: string): Promise<string | undefined> {
    return await get(this.memory, key);
  }

  getFromMemorySync(key: string): string | undefined {
    return getFromMemory(this.memory, key);
  }

  set(key: string, value: string): this {
    this.memory = set(this.memory, key, value);
    return this;
  }
}

export const mem = new EnhancedMap();
