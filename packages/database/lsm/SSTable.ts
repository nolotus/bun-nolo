// src/SSTable.ts
import { promises as fs } from "fs";

export class SSTable {
  private filePath: string;
  private index: Map<string, number>;
  private sortedKeys: string[];

  constructor(filePath: string) {
    this.filePath = filePath;
    this.index = new Map();
    this.sortedKeys = [];
  }

  // 创建一个新的 SSTable 文件，并写入排序后的键值对
  static async create(
    filePath: string,
    entries: [string, string][],
  ): Promise<SSTable> {
    const sortedEntries = entries.sort((a, b) => a[0].localeCompare(b[0]));
    const sstable = new SSTable(filePath);
    const lines = sortedEntries.map(([key, value]) => `${key}:${value}\n`);
    const data = lines.join("");

    try {
      await fs.writeFile(filePath, data, { encoding: "utf-8" });
      console.log(`SSTable file written: ${filePath}`);
    } catch (writeError) {
      console.error(`Failed to write SSTable file: ${filePath}`, writeError);
      throw writeError;
    }

    let offset = 0;
    for (const line of lines) {
      const splitIndex = line.indexOf(":");
      if (splitIndex === -1) continue;
      const key = line.substring(0, splitIndex);
      sstable.index.set(key, offset);
      sstable.sortedKeys.push(key);
      offset += Buffer.byteLength(line, "utf-8");
    }

    return sstable;
  }

  // 从文件加载 SSTable 并构建索引

  static async load(filePath: string): Promise<SSTable> {
    const sstable = new SSTable(filePath);
    const data = await fs.readFile(filePath, "utf-8");
    const lines = data.split("\n").filter((line) => line);
    let offset = 0;
    for (const line of lines) {
      const splitIndex = line.indexOf(":");
      if (splitIndex === -1) continue; // 跳过格式错误的行
      const key = line.substring(0, splitIndex);
      sstable.index.set(key, offset);
      sstable.sortedKeys.push(key);
      offset += Buffer.byteLength(line + "\n", "utf-8");
    }
    return sstable;
  }
  // 根据 key 查找值
  async get(key: string): Promise<string | undefined> {
    const offset = this.index.get(key);
    if (offset === undefined) return undefined;
    const handle = await fs.open(this.filePath, "r");
    const buffer = Buffer.alloc(1024); // 假设一行不超过 1024 字节
    try {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, offset);
      if (bytesRead === 0) return undefined;
      const line = buffer.slice(0, bytesRead).toString("utf-8").split("\n")[0];
      const splitIndex = line.indexOf(":");
      if (splitIndex === -1) return undefined;
      const k = line.substring(0, splitIndex);
      const v = line.substring(splitIndex + 1);
      return k === key ? v : undefined;
    } finally {
      await handle.close();
    }
  }
}
