// 文件：checkQuery.test.ts
import { checkQuery } from "./checkQuery";

describe("checkQuery > verify if the object satisfies all query conditions", () => {
	it("returns true for object satisfying all conditions", () => {
		const obj = { end_time: new Date(), is_template: false };
		const query = {
			end_time: { exists: true },
			is_template: { equals: false },
		};

		expect(checkQuery(obj, query)).toBe(true);
	});

	it("returns false for object not satisfying all conditions", () => {
		const obj = { is_template: true }; // end_time is missing, is_template is true
		const query = {
			end_time: { exists: true },
			is_template: { equals: false },
		};

		expect(checkQuery(obj, query)).toBe(false);
	});

	it("returns true for object with extra properties but satisfying conditions", () => {
		const obj = { end_time: new Date(), is_template: false, extra_prop: 123 };
		const query = {
			end_time: { exists: true },
			is_template: { equals: false },
		};

		expect(checkQuery(obj, query)).toBe(true);
	});

	// ... 可添加更多用例来测试不同的条件组合
});
