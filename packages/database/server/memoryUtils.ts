// memoryUtils.ts

type MemoryStructure = {
  memTable: Map<string, string>;
  immutableMem: Array<Map<string, string>>;
};

export const getFromMemory = (
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
