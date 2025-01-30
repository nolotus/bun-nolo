// ai/cybot/web/fetchPubCybots.ts

import { browserDb } from "database/browser/db";
import { pino } from "pino";
import { Cybot } from "ai/cybot/types";
import { pubCybotKeys } from "database/keys";

const logger = pino({ name: "fetchPubCybots" });

interface FetchPubCybotsOptions {
  limit?: number;
  sortBy?: "newest" | "popular" | "rating";
}

export async function fetchPubCybots(options: FetchPubCybotsOptions = {}) {
  const { limit = 20, sortBy = "newest" } = options;

  try {
    const { start, end } = pubCybotKeys.list();
    const results: Cybot[] = [];

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
          return (b.metrics?.useCount || 0) - (a.metrics?.useCount || 0);
        case "rating":
          return (b.metrics?.rating || 0) - (a.metrics?.rating || 0);
        case "newest":
        default:
          return (b.createTime || 0) - (a.createTime || 0);
      }
    });

    // 分页
    const paginatedResults = results.slice(0, limit);

    logger.debug(
      {
        total: results.length,
        returned: paginatedResults.length,
        options,
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
