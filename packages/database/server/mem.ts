// mem.ts

import { parseStrWithId } from "core/decodeData";
import { extractUserId } from "core/prefix";
import * as fs from "fs/promises";

type MemoryStructure = {
  directMem: Map<string, string>;
  immutableMem: Array<Map<string, string>>;
};

const createMemory = (): MemoryStructure => ({
  directMem: new Map(),
  immutableMem: [],
});

const get = (memory: MemoryStructure, key: string): string | undefined => {
  // 首先检查 directMem
  const directValue = memory.directMem.get(key);
  if (directValue !== undefined) return directValue;

  // 然后从最新到最旧检查 immutableMem
  for (let i = memory.immutableMem.length - 1; i >= 0; i--) {
    const value = memory.immutableMem[i].get(key);
    if (value !== undefined) return value;
  }

  return undefined;
};

const set = (
  memory: MemoryStructure,
  key: string,
  value: string,
): MemoryStructure => {
  const newDirectMem = new Map(memory.directMem);
  newDirectMem.set(key, value);

  if (newDirectMem.size > 3) {
    return {
      directMem: new Map(),
      immutableMem: [...memory.immutableMem, newDirectMem],
    };
  }

  return { ...memory, directMem: newDirectMem };
};

const writeImmutableMemToFile = async (
  immutableMem: Array<Map<string, string>>,
) => {
  try {
    // 从最旧到最新写入
    const data = JSON.stringify(immutableMem.map((m) => Object.fromEntries(m)));
    await fs.writeFile(`immutableMem_${Date.now()}.json`, data);
    console.log("ImmutableMem has been written to file");
    return true;
  } catch (error) {
    console.error("Error writing immutableMem to file:", error);
    return false;
  }
};

const checkAndTriggerWrite = (memory: MemoryStructure): MemoryStructure => {
  if (memory.immutableMem.length >= 3) {
    const memToWrite = memory.immutableMem.slice(0, 3);

    // 触发异步写入，但不等待它完成
    writeImmutableMemToFile(memToWrite)
      .then((writeSuccess) => {
        if (writeSuccess) {
          // 在写入成功后，异步更新内存状态
          memory.immutableMem = memory.immutableMem.slice(3);
        }
      })
      .catch(console.error);
  }

  return memory;
};

const prepareForFileWrite = (memory: MemoryStructure): string => {
  // 从最旧到最新准备数据
  const snapshot = new Map<string, string>();
  for (const mem of memory.immutableMem) {
    for (const [key, value] of mem) {
      snapshot.set(key, value);
    }
  }
  return JSON.stringify(Object.fromEntries(snapshot));
};

class EnhancedMap {
  private memory: MemoryStructure;

  constructor() {
    this.memory = createMemory();
  }

  clear(): void {
    this.memory = createMemory();
  }

  get(key: string): string | undefined {
    return get(this.memory, key);
  }

  set(key: string, value: string): this {
    this.memory = set(this.memory, key, value);
    this.memory = checkAndTriggerWrite(this.memory);
    return this;
  }

  prepareForFileWrite(): string {
    return prepareForFileWrite(this.memory);
  }
}

export const mem = new EnhancedMap();

export const checkMemoryForData = (id: string) => {
  const memValue = mem.get(id);
  if (memValue === "0") {
    return null; // 视为已删除
  }
  if (memValue) {
    return parseStrWithId(id, memValue);
  }
  return undefined; // 表示内存中没有找到数据
};
