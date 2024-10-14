// src/WAL.ts
import { promises as fs } from "fs";
import path from "path";

export type WALOperation = {
  type: "SET" | "DELETE";
  key: string;
  value?: string;
};

export class WAL {
  private walFilePath: string;
  private handle: fs.FileHandle | null;

  constructor(walDir: string) {
    this.walFilePath = path.join(walDir, "wal.log");
    this.handle = null;
  }

  // 初始化 WAL，确保 WAL 文件存在并打开文件句柄
  async init(): Promise<void> {
    this.handle = await fs.open(this.walFilePath, "a+");
  }

  // 写入一条操作到 WAL
  async append(
    operationType: "SET" | "DELETE",
    key: string,
    value?: string,
  ): Promise<void> {
    if (!this.handle) {
      throw new Error("WAL 尚未初始化");
    }
    const operation: WALOperation = { type: operationType, key };
    if (operationType === "SET" && value !== undefined) {
      operation.value = value;
    }
    const line = JSON.stringify(operation) + "\n";
    await this.handle.appendFile(line, { encoding: "utf-8" });
  }

  // 重放 WAL，恢复 MemTable
  async replay(): Promise<WALOperation[]> {
    try {
      const data = await fs.readFile(this.walFilePath, "utf-8");
      const lines = data.split("\n").filter((line) => line.trim() !== "");
      const operations: WALOperation[] = lines.map((line) => JSON.parse(line));
      return operations;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // WAL 文件不存在，返回空操作列表
        return [];
      }
      throw error;
    }
  }

  // 清空 WAL 文件
  async clear(): Promise<void> {
    if (this.handle) {
      await this.handle.truncate(0);
      await this.handle.sync();
    }
  }

  // 关闭 WAL 文件句柄
  async close(): Promise<void> {
    if (this.handle) {
      await this.handle.close();
      this.handle = null;
    }
  }
}
