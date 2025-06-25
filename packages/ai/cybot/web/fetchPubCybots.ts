// ai/cybot/web/fetchPubCybots.ts

import { browserDb } from "database/browser/db";
import { pino } from "pino";

import { pubCybotKeys } from "database/keys";
import { Agent } from "app/types";

const logger = pino({ name: "fetchPubCybots" });

interface FetchPubCybotsOptions {
  limit?: number;
  sortBy?: "newest" | "popular" | "rating";
}

export async function fetchPubCybots(options: FetchPubCybotsOptions = {}) {
  const { limit = 20, sortBy = "newest" } = options;

  try {
    const { start, end } = pubCybotKeys.list();
    const results: Agent[] = [];

    // 使用 iterator 获取范围数据
    for await (const [key, value] of browserDb.iterator({
      gte: start,
      lte: end,
    })) {
      if (value.isPublic) {
        results.push(value);
      }
    }

    // 排序
    results.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.dialogCount || 0) - (a.dialogCount || 0);
        case "rating":
          return (b.messageCount || 0) - (a.messageCount || 0);
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
      "Fetched public cybots"
    );

    return {
      data: paginatedResults,
      total: results.length,
      hasMore: limit < results.length,
    };
  } catch (error) {
    logger.error({ error }, "Failed to fetch public cybots");
    throw error;
  }
}
