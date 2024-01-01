// 文件：conditions.ts
import { isBefore, isAfter } from "date-fns";

export type QueryCondition = {
	exists?: boolean;
	equals?: any;
	after?: Date | string;
	before?: Date | string;
};

// 判断单个条件是否满足的函数
export function isConditionSatisfied(
	targetValue: any,
	condition: QueryCondition,
): boolean {
	if (typeof condition === "object") {
		if (condition.exists !== undefined) {
			const keyExists = targetValue !== undefined;
			if (keyExists !== condition.exists) {
				return false;
			}
		}
		if (condition.equals !== undefined && targetValue !== condition.equals) {
			return false;
		}
		if (condition.after !== undefined) {
			const dateAfter =
				typeof condition.after === "string"
					? new Date(condition.after)
					: condition.after;
			if (!isAfter(targetValue, dateAfter)) {
				return false;
			}
		}
		if (condition.before !== undefined) {
			const dateBefore =
				typeof condition.before === "string"
					? new Date(condition.before)
					: condition.before;
			if (!isBefore(targetValue, dateBefore)) {
				return false;
			}
		}
	} else {
		return targetValue === condition;
	}

	return true;
}
