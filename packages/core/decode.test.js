// 引入我们的函数
import { listToArray } from "./noloToOther";

// Jest 测试
describe("listToArray", () => {
  test("should return an empty array when input is an empty string", () => {
    expect(listToArray("")).toEqual([]);
  });

  test("should split comma-separated values correctly", () => {
    expect(listToArray("one,two,three")).toEqual(["one", "two", "three"]);
  });

  test("should handle values with commas inside quotes", () => {
    expect(listToArray('one,"two,with,commas",three')).toEqual([
      "one",
      "two,with,commas",
      "three",
    ]);
  });

  test("should handle multiple quoted values", () => {
    expect(listToArray('"one,with,comma","two,also,with,comma"')).toEqual([
      "one,with,comma",
      "two,also,with,comma",
    ]);
  });

  test("should handle empty elements correctly", () => {
    expect(listToArray("one,,three")).toEqual(["one", "", "three"]);
  });

  test("should handle a string without commas correctly", () => {
    expect(listToArray("hello")).toEqual(["hello"]);
  });

  test("should handle the case with trailing commas correctly", () => {
    expect(listToArray("one,two,")).toEqual(["one", "two", ""]);
  });
});
