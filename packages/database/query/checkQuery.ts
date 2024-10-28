// 文件：checkQuery.ts
import { QueryCondition, isConditionSatisfied } from "./conditions";

export type ObjectShape = Record<string, any>;
export type QueryConditions = Record<string, QueryCondition>;

// 主函数，用于检查对象是否满足查询条件
export function checkQuery(obj: ObjectShape, query: QueryConditions): boolean {
  return Object.keys(query).every((key) => {
    const condition = query[key];
    const targetValue = obj[key];
    const queryResult = isConditionSatisfied(targetValue, condition);
    return queryResult;
  });
}
