// mem.test.ts

import { describe, test, expect, beforeEach } from "bun:test";
import { mem, checkMemoryForData } from "../mem";
import { extractUserId, setKeyPrefix, Flags } from "core/prefix";

describe("EnhancedMap", () => {
  const testUserId = "testUser123";

  beforeEach(() => {
    mem.clear();
  });

  const createTestKey = (flags: Flags, id: string): string => {
    const prefix = setKeyPrefix(flags);
    return `${prefix}-${testUserId}-${id}`;
  };

  test("should set and get values correctly", () => {
    const key = createTestKey({ isJSON: true }, "key1");
    const testData = { test: "JSON data", nested: { value: 123 } };

    mem.set(key, JSON.stringify(testData));
    expect(JSON.parse(mem.get(key))).toEqual(testData);
    expect(extractUserId(key)).toBe(testUserId);
  });

  test("should move values to immutable memory after 3 sets", () => {
    const key1 = createTestKey({ isJSON: true }, "key1");
    const key2 = createTestKey({ isJSON: true }, "key2");
    const key3 = createTestKey({ isJSON: true }, "key3");

    mem.set(key1, JSON.stringify({ data: "value1" }));
    mem.set(key2, JSON.stringify({ data: "value2" }));
    mem.set(key3, JSON.stringify({ data: "value3" }));

    expect(JSON.parse(mem.get(key1))).toEqual({ data: "value1" });
    expect(JSON.parse(mem.get(key2))).toEqual({ data: "value2" });
    expect(JSON.parse(mem.get(key3))).toEqual({ data: "value3" });
  });

  test("should correctly handle values in both direct and immutable memory", () => {
    const key1 = createTestKey({ isJSON: true }, "key1");
    const key2 = createTestKey({ isJSON: true }, "key2");
    const key3 = createTestKey({ isJSON: true }, "key3");
    const key4 = createTestKey({ isJSON: true }, "key4");

    mem.set(key1, JSON.stringify({ data: "value1" }));
    mem.set(key2, JSON.stringify({ data: "value2" }));
    mem.set(key3, JSON.stringify({ data: "value3" }));
    mem.set(key4, JSON.stringify({ data: "value4" }));

    expect(JSON.parse(mem.get(key1))).toEqual({ data: "value1" }); // In immutable memory
    expect(JSON.parse(mem.get(key4))).toEqual({ data: "value4" }); // In direct memory
  });

  test("should correctly implement checkMemoryForData function", () => {
    const key1 = createTestKey({ isJSON: true }, "key1");
    const key2 = createTestKey({ isJSON: true }, "key2");
    const key3 = createTestKey({ isJSON: true }, "key3");

    mem.set(key1, JSON.stringify({ data: "value1" }));
    mem.set(key2, "0"); // Simulating deleted data
    mem.set(key3, JSON.stringify({ data: "value3" }));

    expect(checkMemoryForData(key1)).toBeDefined();
    expect(checkMemoryForData(key2)).toBeNull();
    expect(
      checkMemoryForData(createTestKey({ isJSON: true }, "key4")),
    ).toBeUndefined();
  });
});
