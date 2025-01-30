// ai/cybot/server/fetchPubCybots.ts
import { pino } from "pino";
import { Cybot } from "ai/cybot/types";
import serverDb from "database/server/db";
import { pubCybotKeys } from "database/keys";

const logger = pino({ name: "server:fetchPubCybots" });

interface FetchPubCybotsOptions {
  limit?: number;
  sortBy?: "newest" | "popular" | "rating";
}

export async function fetchPubCybots(options: FetchPubCybotsOptions = {}) {
  const { limit = 20, sortBy = "newest" } = options;

  try {
    const startTime = Date.now();
    const { start, end } = pubCybotKeys.list();

    logger.info({
      event: "fetch_pub_cybots_start",
      options: { limit, sortBy },
      range: { start, end },
    });

    const results: Cybot[] = [];
    let scannedCount = 0;

    for await (const [key, value] of serverDb.iterator({
      gte: start,
      lte: end,
    })) {
      scannedCount++;
      if (value.isPublic) {
        results.push(value);
      }
    }

    // Add metrics collection time for debug
    const preSort = Date.now();

    results.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.metrics?.useCount ?? 0) - (a.metrics?.useCount ?? 0);
        case "rating":
          return (b.metrics?.rating ?? 0) - (a.metrics?.rating ?? 0);
        case "newest":
        default:
          // 确保使用 createTime 而不是 createAt
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    const paginatedResults = results.slice(0, limit);

    const timeTaken = Date.now() - startTime;
    const sortTime = Date.now() - preSort;

    logger.info({
      event: "fetch_pub_cybots_complete",
      stats: {
        scanned: scannedCount,
        total: results.length,
        returned: paginatedResults.length,
        timeTaken,
        sortTime,
      },
      sortBy,
      hasMore: results.length > limit,
    });

    return {
      data: paginatedResults,
      total: results.length,
      hasMore: results.length > limit,
    };
  } catch (error) {
    logger.error({
      event: "fetch_pub_cybots_error",
      error: error instanceof Error ? error.message : String(error),
      options: { limit, sortBy },
    });
    throw error;
  }
}
