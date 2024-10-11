// mem.test.ts

import { describe, it, expect, beforeEach } from "bun:test";
import { mem, checkMemoryForData } from "../mem";

describe("EnhancedMap", () => {
  beforeEach(() => {
    mem.clear();
  });

  it("should set and get values correctly", () => {
    mem.set("key1", "value1");
    expect(mem.get("key1")).toBe("value1");
  });

  it("should move values to immutable memory after 3 sets", () => {
    mem.set("key1", "value1");
    mem.set("key2", "value2");
    mem.set("key3", "value3");

    const memoryState = mem.getMemoryState();
    expect(memoryState.directMem.size).toBe(0);
    expect(memoryState.immutableMem.size).toBe(3);
  });

  it("should correctly handle values in both direct and immutable memory", () => {
    mem.set("key1", "value1");
    mem.set("key2", "value2");
    mem.set("key3", "value3");
    mem.set("key4", "value4");

    expect(mem.get("key1")).toBe("value1"); // In immutable memory
    expect(mem.get("key4")).toBe("value4"); // In direct memory
  });

  it("should correctly implement size property", () => {
    mem.set("key1", "value1");
    mem.set("key2", "value2");
    expect(mem.size).toBe(2);

    mem.set("key3", "value3");
    mem.set("key4", "value4");
    expect(mem.size).toBe(4);
  });

  it("should correctly implement has method", () => {
    mem.set("key1", "value1");
    mem.set("key2", "value2");
    mem.set("key3", "value3");

    expect(mem.has("key1")).toBe(true);
    expect(mem.has("key4")).toBe(false);
  });

  it("should correctly implement delete method", () => {
    mem.set("key1", "value1");
    mem.set("key2", "value2");
    mem.set("key3", "value3");

    expect(mem.delete("key2")).toBe(true);
    expect(mem.has("key2")).toBe(false);
    expect(mem.delete("key4")).toBe(false);
  });

  it("should correctly implement checkMemoryForData function", () => {
    mem.set("key1", "value1");
    mem.set("key2", 0);
    mem.set("key3", "value3");

    expect(checkMemoryForData("key1")).toBeDefined();
    expect(checkMemoryForData("key2")).toBeNull();
    expect(checkMemoryForData("key4")).toBeUndefined();
  });
});
