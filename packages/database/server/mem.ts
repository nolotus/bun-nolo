// mem.ts

import { parseStrWithId } from "core/decodeData";
import { extractUserId } from "core/prefix";

type MemoryStructure = {
  directMem: Map<string, any>;
  immutableMem: Map<string, Map<string, any>>; // 修改为嵌套Map结构
  count: number;
};

const createMemory = (): MemoryStructure => ({
  directMem: new Map(),
  immutableMem: new Map(),
  count: 0,
});

/**
 * 更新内存结构
 * @param memory 当前的内存结构
 * @param key 要设置的键
 * @param value 要设置的值
 * @returns 更新后的内存结构
 */
const updateMemory = (
  memory: MemoryStructure,
  key: string,
  value: any,
): MemoryStructure => {
  // 创建directMem的新副本并设置新值
  const newDirectMem = new Map(memory.directMem);
  newDirectMem.set(key, value);

  // 增加计数器
  const newCount = memory.count + 1;

  // 每三次操作，将数据移动到immutableMem
  if (newCount % 3 === 0) {
    const newImmutableMem = new Map(memory.immutableMem);

    // 遍历directMem中的所有项
    for (const [id, val] of newDirectMem) {
      const dataUserId = extractUserId(id);

      // 如果该用户的Map不存在，则创建一个新的
      if (!newImmutableMem.has(dataUserId)) {
        newImmutableMem.set(dataUserId, new Map());
      }

      // 将数据添加到对应用户的Map中
      newImmutableMem.get(dataUserId)!.set(id, val);
    }

    // 返回更新后的内存结构，清空directMem
    return {
      directMem: new Map(),
      immutableMem: newImmutableMem,
      count: newCount,
    };
  }

  // 如果不需要移动到immutableMem，直接返回更新后的结构
  return {
    ...memory,
    directMem: newDirectMem,
    count: newCount,
  };
};

class EnhancedMap {
  private memory: MemoryStructure;

  constructor() {
    this.memory = createMemory();
  }

  clear(): void {
    this.memory = createMemory();
  }

  get(key: string): any | undefined {
    const userId = extractUserId(key);
    return (
      this.memory.directMem.get(key) ??
      this.memory.immutableMem.get(userId)?.get(key)
    );
  }

  set(key: string, value: any): this {
    this.memory = updateMemory(this.memory, key, value);
    return this;
  }
}

export const mem = new EnhancedMap();

export const checkMemoryForData = (id: string) => {
  const memValue = mem.get(id);
  if (memValue === "0" || memValue === 0) {
    return null; // 视为已删除
  }
  if (memValue) {
    return parseStrWithId(id, memValue);
  }
  return undefined; // 表示内存中没有找到数据
};
