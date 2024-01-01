// 文件：conditions.test.ts
import { isConditionSatisfied, QueryCondition } from "./conditions";

// 测试isConditionSatisfied函数
describe("isConditionSatisfied > should validate if the key exists", () => {
	it("returns true if the key is expected to exist and it does", () => {
		expect(isConditionSatisfied("value", { exists: true })).toBe(true);
	});

	it("returns false if the key is expected to exist and it does not", () => {
		expect(isConditionSatisfied(undefined, { exists: true })).toBe(false);
	});

	it("returns true if the key is expected not to exist and it does not", () => {
		expect(isConditionSatisfied(undefined, { exists: false })).toBe(true);
	});

	it("returns false if the key is expected not to exist and it does", () => {
		expect(isConditionSatisfied("value", { exists: false })).toBe(false);
	});
});
