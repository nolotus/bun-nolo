// ai/agent/web/fetchPublicAgents.ts

import { browserDb } from "database/browser/db";
import { pino } from "pino";
import { pubAgentKeys } from "database/keys";
import { Agent } from "app/types";

const logger = pino({ name: "fetchPublicAgents" });

interface FetchPublicAgentsOptions {
  limit?: number;
  sortBy?:
    | "newest"
    | "popular"
    | "rating"
    | "outputPriceAsc"
    | "outputPriceDesc";
  searchName?: string;
}

export async function fetchPublicAgents(
  options: FetchPublicAgentsOptions = {}
) {
  const { limit = 20, sortBy = "newest", searchName } = options;

  try {
    const { start, end } = pubAgentKeys.list();
    let results: Agent[] = [];

    // 使用 iterator 获取范围数据
    for await (const [key, value] of browserDb.iterator({
      gte: start,
      lte: end,
    })) {
      if (value.isPublic) {
        results.push(value);
      }
    }

    // 添加名称过滤逻辑
    if (searchName) {
      results = results.filter((agent) =>
        agent.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // 更新排序逻辑以支持价格排序
    results.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.dialogCount || 0) - (a.dialogCount || 0);
        case "rating":
          return (b.messageCount || 0) - (a.messageCount || 0);

        // [修复] 使用 parseFloat 强制转换类型，确保数字比较
        case "outputPriceAsc":
          const priceA_asc = parseFloat(String(a.outputPrice)) || Infinity;
          const priceB_asc = parseFloat(String(b.outputPrice)) || Infinity;
          return priceA_asc - priceB_asc;

        // [修复] 使用 parseFloat 强制转换类型，确保数字比较
        case "outputPriceDesc":
          const priceA_desc = parseFloat(String(a.outputPrice)) || -Infinity;
          const priceB_desc = parseFloat(String(b.outputPrice)) || -Infinity;
          return priceB_desc - priceA_desc;

        case "newest":
        default:
          const timeA =
            typeof a.createdAt === "string"
              ? Date.parse(a.createdAt)
              : a.createdAt;
          const timeB =
            typeof b.createdAt === "string"
              ? Date.parse(b.createdAt)
              : b.createdAt;
          return timeB - timeA;
      }
    });

    // 分页
    const paginatedResults = results.slice(0, limit);

    logger.debug(
      {
        total: results.length,
        returned: paginatedResults.length,
        sortBy,
        limit,
        firstItemCreatedAt: paginatedResults[0]?.createdAt,
      },
      "Fetched public agents"
    );

    return {
      data: paginatedResults,
      total: results.length,
      hasMore: limit < results.length,
    };
  } catch (error) {
    logger.error({ error }, "Failed to fetch public agents");
    throw error;
  }
}
