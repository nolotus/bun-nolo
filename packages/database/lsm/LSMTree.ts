// src/LSMTree.ts
import { MemTable } from "./MemTable";
import { SSTable } from "./SSTable";
import { promises as fs } from "fs";
import path from "path";
import { WAL, WALOperation } from "./WAL";

export class LSMTree {
  private memTable: MemTable;
  private immutableMemTables: MemTable[];
  private ssTables: SSTable[];
  private maxMemTableSize: number;
  private fileCounter: number;
  private ssTableDir: string;
  private wal: WAL;

  // 私有构造函数，仅用于内部创建实例
  private constructor(options?: {
    maxMemTableSize?: number;
    ssTableDir?: string;
  }) {
    this.memTable = new MemTable();
    this.immutableMemTables = [];
    this.ssTables = [];
    this.maxMemTableSize = options?.maxMemTableSize || 100;
    this.fileCounter = 0;
    this.ssTableDir =
      options?.ssTableDir || path.join(process.cwd(), "sstables");
    this.wal = new WAL(this.ssTableDir);
  }

  // 静态异步工厂方法，用于创建和初始化 LSMTree 实例
  static async open(options?: {
    maxMemTableSize?: number;
    ssTableDir?: string;
  }): Promise<LSMTree> {
    const instance = new LSMTree(options);
    await fs.mkdir(instance.ssTableDir, { recursive: true });
    try {
      await fs.access(instance.ssTableDir);
      console.log(`SSTable directory exists: ${instance.ssTableDir}`);
    } catch {
      throw new Error(
        `Failed to create SSTable directory: ${instance.ssTableDir}`,
      );
    }
    // 初始化 WAL
    await instance.wal.init();
    // 重放 WAL 以恢复 MemTable
    const walOperations = await instance.wal.replay();
    for (const op of walOperations) {
      if (op.type === "SET" && op.value !== undefined) {
        instance.memTable.set(op.key, op.value);
      } else if (op.type === "DELETE") {
        instance.memTable.delete(op.key);
      }
    }
    // 加载 SSTable 文件
    const files = await fs.readdir(instance.ssTableDir);
    const sstableFiles = files
      .filter((name) => name.startsWith("sstable-") && name.endsWith(".txt"))
      .sort((a, b) => {
        // 根据文件编号排序，确保从旧到新
        const aNum = parseInt(a.match(/sstable-(\d+)\.txt/)![1], 10);
        const bNum = parseInt(b.match(/sstable-(\d+)\.txt/)![1], 10);
        return aNum - bNum;
      });
    // 加载每个 SSTable 文件
    for (const file of sstableFiles) {
      const filePath = path.join(instance.ssTableDir, file);
      const sstable = await SSTable.load(filePath);
      instance.ssTables.unshift(sstable); // 最新的 SSTable 放在前面
      // 更新 fileCounter
      const match = file.match(/sstable-(\d+)\.txt/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= instance.fileCounter) {
          instance.fileCounter = num + 1;
        }
      }
    }
    return instance;
  }

  async set(key: string, value: string): Promise<void> {
    // 先写入 WAL
    await this.wal.append("SET", key, value);
    this.memTable.set(key, value);
    if (this.memTable.getAllEntries().length >= this.maxMemTableSize) {
      await this.flushMemTable();
    }
  }

  async get(key: string): Promise<string | undefined> {
    // 优先从 MemTable 中查找
    const value = this.memTable.get(key);
    if (value !== undefined) {
      return value === "__deleted__" ? undefined : value;
    }
    // 然后从 Immutable MemTables 中查找
    for (const immMem of this.immutableMemTables) {
      const val = immMem.get(key);
      if (val !== undefined) {
        return val === "__deleted__" ? undefined : val;
      }
    }
    // 最后从 SSTables 中查找
    for (const sstable of this.ssTables) {
      const val = await sstable.get(key);
      if (val !== undefined) {
        return val === "__deleted__" ? undefined : val;
      }
    }
    return undefined;
  }

  async delete(key: string): Promise<void> {
    // 先写入 WAL
    await this.wal.append("DELETE", key);
    this.memTable.delete(key);
    if (this.memTable.getAllEntries().length >= this.maxMemTableSize) {
      await this.flushMemTable();
    }
  }

  // 刷新 MemTable 到磁盘
  private async flushMemTable(): Promise<void> {
    if (this.memTable.isEmpty()) return;

    this.immutableMemTables.push(this.memTable);
    this.memTable = new MemTable();

    const filePathTemp = path.join(
      this.ssTableDir,
      `sstable-${this.fileCounter}.tmp`,
    );
    const filePathFinal = path.join(
      this.ssTableDir,
      `sstable-${this.fileCounter}.txt`,
    );
    const entriesToFlush =
      this.immutableMemTables.shift()?.getAllEntries() || [];

    if (entriesToFlush.length === 0) return;

    try {
      console.log(`创建临时 SSTable 文件: ${filePathTemp}`);
      await SSTable.create(filePathTemp, entriesToFlush);
      console.log(`SSTable file written: ${filePathTemp}`);

      // 确认临时文件存在
      try {
        await fs.access(filePathTemp);
        console.log(
          `Temporary SSTable file created successfully: ${filePathTemp}`,
        );
      } catch {
        throw new Error(
          `Temporary SSTable file was not created: ${filePathTemp}`,
        );
      }

      console.log(`重命名 SSTable 文件为: ${filePathFinal}`);
      await fs.rename(filePathTemp, filePathFinal);
      console.log(`SSTable file renamed successfully: ${filePathFinal}`);

      // 重新加载重命名后的 SSTable
      const sstableFinal = await SSTable.load(filePathFinal);
      this.ssTables.unshift(sstableFinal); // 新的 SSTable 放在前面，优先查询
      this.fileCounter += 1;

      // 清空 WAL，因为数据已经持久化
      await this.wal.clear();
    } catch (error) {
      console.error("刷新 MemTable 失败:", error);
      throw error;
    }
  }

  // 手动触发刷写操作
  async flush(): Promise<void> {
    await this.flushMemTable();
  }

  // 关闭 LSMTree，确保所有 MemTable 刷写到磁盘
  async close(): Promise<void> {
    await this.flush();
    await this.wal.close();
  }
}
