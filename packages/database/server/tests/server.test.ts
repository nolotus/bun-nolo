// server.test.ts
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { serverWrite } from "../write";
import { serverGetData } from "../read";
import { mem } from "../mem";
import * as fs from "fs";
import * as path from "path";
import { setKeyPrefix, Flags } from "core/prefix";

describe("Server Write and Read Tests", () => {
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
});
