import { QueryCondition } from "./types";

export const evaluateCondition = (
	condition: QueryCondition,
	objectData: any,
): boolean => {
	// Handle logical operators
	if (condition.$and) {
		return condition.$and.every((cond) => evaluateCondition(cond, objectData));
	}
	if (condition.$or) {
		return condition.$or.some((cond) => evaluateCondition(cond, objectData));
	}
	if (condition.$not) {
		return !evaluateCondition(condition.$not, objectData);
	}
	if (condition.$nor) {
		return !condition.$nor.some((cond) => evaluateCondition(cond, objectData));
	}

	// Handle arithmetic operators
	for (const key in condition) {
		switch (key) {
			// 在 "Handle arithmetic operators" 部分添加以下代码

			case "$gt":
				if (
					!Object.keys(condition.$gt!).every(
						(k) => objectData[k] > condition.$gt![k],
					)
				) {
					return false;
				}
				break;
			case "$lt":
				if (
					!Object.keys(condition.$lt!).every(
						(k) => objectData[k] < condition.$lt![k],
					)
				) {
					return false;
				}
				break;

			case "$ne":
				if (
					!Object.keys(condition.$ne!).every(
						(k) => objectData[k] !== condition.$ne![k],
					)
				) {
					return false;
				}
				break;
			case "$in":
				if (
					!Object.keys(condition.$in!).every((k) =>
						condition.$in![k].includes(objectData[k]),
					)
				) {
					return false;
				}
				break;
			case "$nin":
				if (
					!Object.keys(condition.$nin!).every(
						(k) => !condition.$nin![k].includes(objectData[k]),
					)
				) {
					return false;
				}
				break;
			case "$size":
				if (
					!Object.keys(condition.$size!).every(
						(k) => objectData[k].length === condition.$size![k],
					)
				) {
					return false;
				}
				break;
		}
	}

	// Handle $all operator
	if (condition.$all) {
		for (const key in condition.$all) {
			if (
				!condition.$all[key].every((element) =>
					objectData[key].includes(element),
				)
			) {
				return false;
			}
		}
	}

	// Handle $elemMatch operator
	if (condition.$elemMatch) {
		for (const key in condition.$elemMatch) {
			const elemMatchCondition = condition.$elemMatch[key];
			if (
				elemMatchCondition &&
				!objectData[key].some((element: any) =>
					evaluateCondition(elemMatchCondition, element),
				)
			) {
				return false;
			}
		}
	}

	return true; // Return true if no conditions are false
};

// TODO: 实现查询功能
// 8. 扩展数据类型支持 - 优先级：低，难度：低
// 13. 添加更新和删除操作 - 优先级：中，难度：中

// 10. 支持聚合和分析 - 优先级：低，难度：高
//支持正则表达式和模糊匹配。
// 11. 实现地理空间查询 - 优先级：低，难度：高
// 12. 支持文本搜索 - 优先级：低，难度：中
// 6. 支持地理空间类型 - 优先级：中，难度：高
// 9. 实施索引和性能优化 - 优先级：中，难度：高
