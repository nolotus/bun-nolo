// server.test.ts
import { describe, it, expect, beforeEach, afterEach, jest } from "bun:test";
import { serverWrite } from "../write";
import { serverGetData } from "../read";
import { mem, checkMemoryForData } from "../mem";
import * as fs from "fs";
import * as path from "path";
import { setKeyPrefix, Flags } from "core/prefix";
import { handleDelete } from "../delete"; // 假设你有一个 handleDelete 函数

describe("Server Write, Read, and Delete Tests", () => {
  const testUserId = "testUser123";
  const testDataDir = path.join("nolodata", testUserId);

  beforeEach(() => {
    if (fs.existsSync(testDataDir)) {
      fs.rmdirSync(testDataDir, { recursive: true });
    }
    fs.mkdirSync(testDataDir, { recursive: true });
    mem.clear();
  });

  afterEach(() => {
    if (fs.existsSync(testDataDir)) {
      fs.rmdirSync(testDataDir, { recursive: true });
    }
    mem.clear();
  });

  const createPrefix = (flags: Flags): string => {
    return setKeyPrefix(flags);
  };

  it("should write and read JSON data", async () => {
    const testData = { test: "JSON data", nested: { value: 123 } };
    const prefix = createPrefix({ isJSON: true });
    const dataKey = `${prefix}-${testUserId}-jsonId`;

    await serverWrite(dataKey, JSON.stringify(testData), testUserId);
    const readResult = await serverGetData(dataKey);

    expect(readResult).toEqual(testData);
  });

  it("should use memory cache for repeated JSON reads", async () => {
    const testData = { cached: "data", nested: { array: [1, 2, 3] } };
    const prefix = createPrefix({ isJSON: true });
    const dataKey = `${prefix}-${testUserId}-cacheId`;

    await serverWrite(dataKey, JSON.stringify(testData), testUserId);
    await serverGetData(dataKey); // First read to cache

    // Modify the file to ensure next read is from cache
    const indexPath = path.join(testDataDir, "index.nolo");
    fs.writeFileSync(indexPath, "Modified content");

    const cachedResult = await serverGetData(dataKey);

    expect(cachedResult).toEqual(testData);
  });

  it("should mark data as deleted in memory", async () => {
    const testData = { toDelete: "This data will be deleted" };
    const prefix = createPrefix({ isJSON: true });
    const dataKey = `${prefix}-${testUserId}-deleteId`;

    await serverWrite(dataKey, JSON.stringify(testData), testUserId);

    // Mock request and response objects
    const req = {
      user: { userId: testUserId },
      params: { id: dataKey },
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await handleDelete(req, res);

    // Check if the data is marked as deleted in memory
    const memResult = checkMemoryForData(dataKey);
    expect(memResult).toBeNull();

    // Attempt to read the deleted data
    const readResult = await serverGetData(dataKey);
    expect(readResult).toBeNull();
  });

  it("should not return deleted data in subsequent reads", async () => {
    const testData = { toDelete: "This data will be deleted" };
    const prefix = createPrefix({ isJSON: true });
    const dataKey = `${prefix}-${testUserId}-deleteId`;

    await serverWrite(dataKey, JSON.stringify(testData), testUserId);

    // Delete the data
    const req = {
      user: { userId: testUserId },
      params: { id: dataKey },
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleDelete(req, res);

    // Attempt to read the deleted data multiple times
    const readResult1 = await serverGetData(dataKey);
    const readResult2 = await serverGetData(dataKey);
    const readResult3 = await serverGetData(dataKey);

    expect(readResult1).toBeNull();
    expect(readResult2).toBeNull();
    expect(readResult3).toBeNull();
  });
});
