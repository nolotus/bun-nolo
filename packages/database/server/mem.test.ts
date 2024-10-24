// mem.test.ts
import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { mem } from "./mem";
import fs from "fs/promises";
import path from "path";
import os from "os";

describe("EnhancedMap", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `nolodata-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    mem.clear();
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.error("Error cleaning up test directory:", error);
    }
  });

  test("should handle multiple writes to same key", async () => {
    const key = "testKey";

    // 连续写入8个值到同一个key
    for (let i = 1; i <= 8; i++) {
      await mem.set(key, `value${i}`);
      // 每次写入后立即验证
      const value = mem.get(key);
      expect(value).toBe(`value${i}`);
      console.log(`Iteration ${i}: wrote value${i}, read ${value}`);
    }

    // 最终验证
    const finalValue = mem.get(key);
    expect(finalValue).toBe("value8");

    // 验证文件写入
    const files = await fs.readdir(testDir);
    console.log("Generated files:", files);
  });

  test("should handle multiple different keys", async () => {
    // 写入8个不同的key
    for (let i = 1; i <= 8; i++) {
      await mem.set(`key${i}`, `value${i}`);
    }

    // 验证所有key都能读取到正确的值
    for (let i = 1; i <= 8; i++) {
      const value = await mem.get(`key${i}`);
      expect(value).toBe(`value${i}`);
      console.log(`Verified key${i} => ${value}`);
    }

    // 打印最终状态
    mem.debugPrint();

    // 验证文件状态
    const files = await fs.readdir(testDir);
    console.log("Total files created:", files.length);
    console.log("Files:", files);
  });
});
