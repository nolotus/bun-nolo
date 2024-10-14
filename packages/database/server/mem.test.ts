// mem.test.ts
import { mem } from "./mem";
import { describe, test, expect, beforeEach, it } from "bun:test";

describe("EnhancedMap", () => {
  beforeEach(() => {
    mem.clear();
  });

  it("should store and retrieve values correctly", async () => {
    await mem.set("key1", "value1");
    expect(mem.get("key1")).toBe("value1");
  });

  it("should handle more than 3 keys by creating immutable memory", async () => {
    await mem.set("key1", "value1");
    await mem.set("key2", "value2");
    await mem.set("key3", "value3");
    await mem.set("key4", "value4");

    expect(mem.get("key1")).toBe("value1");
    expect(mem.get("key2")).toBe("value2");
    expect(mem.get("key3")).toBe("value3");
    expect(mem.get("key4")).toBe("value4");
  });

  it("should return undefined for non-existent keys", () => {
    expect(mem.get("nonexistent")).toBeUndefined();
  });

  it("should clear all data", async () => {
    await mem.set("key1", "value1");
    mem.clear();
    expect(mem.get("key1")).toBeUndefined();
  });
});
