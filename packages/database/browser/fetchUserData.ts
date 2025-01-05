import { db } from "./db";
// 支持单类型或多类型查询
export async function fetchUserData(types: string | string[], userId: string) {
  const results: Record<string, any[]> = {};

  // 统一转换为数组
  const typeArray = Array.isArray(types) ? types : [types];

  try {
    // 创建前缀范围
    const ranges = typeArray.map((type) => ({
      type,
      gte: `${type}-${userId}`,
      lte: `${type}-${userId}\uffff`,
    }));

    // 只需要一次迭代，在迭代过程中分类
    for await (const [key, value] of db.iterator({
      gte: ranges[0].gte,
      lte: ranges[ranges.length - 1].lte,
    })) {
      // 确定当前key属于哪个类型
      const type = typeArray.find((t) => key.startsWith(`${t}-${userId}`));
      if (type) {
        if (!results[type]) {
          results[type] = [];
        }
        results[type].push(value);
      }
    }

    // 如果是单类型查询，直接返回数组
    return Array.isArray(types) ? results : results[types];
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}
