// mem.ts

type MemoryStructure = {
  memTable: Map<string, string>;
  immutableMem: Array<Map<string, string>>;
};

const createMemory = (): MemoryStructure => ({
  memTable: new Map(),
  immutableMem: [],
});

const get = (memory: MemoryStructure, key: string): string | undefined => {
  if (!memory || !memory.memTable) {
    console.error("Invalid memory structure in get function");
    return undefined;
  }

  const memTableValue = memory.memTable.get(key);
  if (memTableValue !== undefined) {
    return memTableValue;
  }

  for (let i = memory.immutableMem.length - 1; i >= 0; i--) {
    const value = memory.immutableMem[i].get(key);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
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
    const result = {
      memTable: new Map(),
      immutableMem: [...memory.immutableMem, newMemTable],
    };
    return result;
  }

  const result = { ...memory, memTable: newMemTable };
  return result;
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

  async set(key: string, value: string): Promise<this> {
    this.memory = set(this.memory, key, value);
    return this;
  }
}

export const mem = new EnhancedMap();
