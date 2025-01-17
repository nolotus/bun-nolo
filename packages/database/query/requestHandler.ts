import serverDb from "../server/db";
import { queryData } from "./queryHandler";
import { QueryOptions } from "./types";

async function fetchUserData(types: string | string[], userId: string) {
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
    for await (const [key, value] of serverDb.iterator({
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

export const handleQuery = async (req, res) => {
  try {
    const options: QueryOptions = {
      userId: req.params.userId,
      isJSON: req.query.isJSON === "true",
      condition: req.body,
      limit: Number(req.query.limit),
    };
    if (options.userId === "local") {
      console.log("has local query ");
      return res.status(400).json({ error: "UserId is local" });
    }

    if (
      options.userId === undefined ||
      options.userId.trim() === "" ||
      options.userId === "undefined"
    ) {
      return res.status(400).json({ error: "UserId is required" });
    }

    if (options.userId.length < 11) {
      console.log("newuser options", options);
      const result = await fetchUserData(
        [options.condition.type],
        options.userId
      );
      console.log("new user query result", result);
      return res.status(200).json({ result });
    }

    const data = await queryData(options);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
