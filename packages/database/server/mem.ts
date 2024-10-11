// mem.ts

import { parseStrWithId } from "core/decodeData";

export let mem = new Map();

export const checkMemoryForData = (id: string) => {
  const memValue = mem.get(id);
  if (memValue === 0) {
    return null; // 视为已删除
  }
  if (memValue) {
    return parseStrWithId(id, memValue);
  }
  return undefined; // 表示内存中没有找到数据
};
