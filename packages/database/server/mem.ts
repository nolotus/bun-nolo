// mem.ts

import fs from "fs";
import path from "path";

type MemoryStructure = {
  memTable: Map<string, string>;
  immutableMem: Array<Map<string, string>>;
};

const createMemory = (): MemoryStructure => ({
  memTable: new Map(),
  immutableMem: [],
});

const readFromFile = async (key: string): Promise<string | undefined> => {
  try {
    // 假设文件中以JSON格式存储数据
    const data = fs.readFileSync(path.resolve(__dirname, "data.json"), "utf-8");
    const jsonData = JSON.parse(data);
    return jsonData[key];
  } catch (error) {
    console.error("Error reading from file", error);
    return undefined;
  }
};

const getFromMemory = (
  memory: MemoryStructure,
  key: string,
): string | undefined => {
  if (!memory || !memory.memTable) {
    console.error("Invalid memory structure in getFromMemory function");
    return undefined;
  }

  const memTableValue = memory.memTable.get(key);
  if (memTableValue !== undefined) {
    return memTableValue;
  }

  for (let i = memory.immutableMem.length - 1; i >= 0; i--) {
    const immutableValue = memory.immutableMem[i].get(key);
    if (immutableValue !== undefined) {
      return immutableValue;
    }
  }

  return undefined;
};

const get = async (
  memory: MemoryStructure,
  key: string,
): Promise<string | undefined> => {
  const memoryValue = getFromMemory(memory, key);
  if (memoryValue !== undefined) {
    return memoryValue;
  }

  // 如果内存区找不到，尝试从文件中读取
  return await readFromFile(key);
};

const moveToImmutable = (memory: MemoryStructure): MemoryStructure => {
  return {
    memTable: new Map(),
    immutableMem: [...memory.immutableMem, new Map(memory.memTable)],
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

  if (newMemTable.size > 3) {
    return moveToImmutable({ ...memory, memTable: newMemTable });
  }

  return { ...memory, memTable: newMemTable };
};

class EnhancedMap {
  private memory: MemoryStructure;

  constructor() {
    this.memory = createMemory();
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
