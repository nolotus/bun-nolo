// tests/SSTable.test.ts
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { SSTable } from "../SSTable";
import { existsSync, unlinkSync } from "fs";

// 定义测试用的文件路径
const TEST_FILE_PATH = "test_sstable.txt";

// 测试数据（符合 userId-ulid 格式）
const testEntries: [string, string][] = [
  ["user1-01F8MECHZX3TBDSZ7XRADM79XE", "用户1的数据"],
  ["user2-01F8MECHZX3TBDSZ7XRADM79XF", "用户2的数据"],
  ["user3-01F8MECHZX3TBDSZ7XRADM79XG", "用户3的数据"],
  ["user4-01F8MECHZX3TBDSZ7XRADM79XH", "用户4的数据"],
  ["user5-01F8MECHZX3TBDSZ7XRADM79XI", "用户5的数据"],
];

describe("SSTable", () => {
  // 在所有测试之前，确保测试文件不存在
  beforeAll(() => {
    if (existsSync(TEST_FILE_PATH)) {
      unlinkSync(TEST_FILE_PATH);
    }
  });

  // 在所有测试之后，删除测试文件
  afterAll(() => {
    if (existsSync(TEST_FILE_PATH)) {
      unlinkSync(TEST_FILE_PATH);
    }
  });

  it("应该正确创建并写入符合格式的 SSTable 文件", async () => {
    const sstable = await SSTable.create(TEST_FILE_PATH, testEntries);

    // 检查文件是否存在
    expect(existsSync(TEST_FILE_PATH)).toBe(true);

    // 检查索引是否正确
    const sortedEntries = [...testEntries].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    for (const [key, _] of sortedEntries) {
      expect(sstable["index"].has(key)).toBe(true); // 访问私有属性
    }

    // 可选：通过读取文件内容进一步验证
    const fileContent = await Bun.file(TEST_FILE_PATH).text();
    const expectedContent =
      sortedEntries.map(([k, v]) => `${k}:${v}`).join("\n") + "\n";
    expect(fileContent).toBe(expectedContent);
  });

  it("应该正确加载已有的 SSTable 文件", async () => {
    const loadedSSTable = await SSTable.load(TEST_FILE_PATH);

    // 检查索引是否正确
    const sortedEntries = [...testEntries].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    for (const [key, _] of sortedEntries) {
      expect(loadedSSTable["index"].has(key)).toBe(true); // 访问私有属性
    }

    // 可选：通过尝试获取每个键的值来间接验证
    for (const [key, value] of testEntries) {
      const result = await loadedSSTable.get(key);
      expect(result).toBe(value);
    }
  });

  it("应该根据键正确返回对应的值", async () => {
    const sstable = await SSTable.load(TEST_FILE_PATH);

    for (const [key, value] of testEntries) {
      const result = await sstable.get(key);
      expect(result).toBe(value);
    }

    // 测试不存在的键
    const nonExistent = await sstable.get("user6-01F8MECHZX3TBDSZ7XRADM79XJ");
    expect(nonExistent).toBeUndefined();

    // 测试无效格式的键
    const invalidKey = "invalidKeyFormat";
    const invalidResult = await sstable.get(invalidKey);
    expect(invalidResult).toBeUndefined();
  });
});
