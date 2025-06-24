// ai/cybot/server/fetchPubCybots.ts
import serverDb from "database/server/db";
import { pubCybotKeys } from "database/keys";
import { BotConfig } from "app/types";

interface FetchPubCybotsOptions {
  limit?: number;
  sortBy?: "newest" | "popular" | "rating";
}

export async function fetchPubCybots(options: FetchPubCybotsOptions = {}) {
  const { limit = 20, sortBy = "newest" } = options;

  try {
    const { start, end } = pubCybotKeys.list();

    const results: BotConfig[] = [];
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

    results.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.metrics?.useCount ?? 0) - (a.metrics?.useCount ?? 0);
        case "rating":
          return (b.metrics?.rating ?? 0) - (a.metrics?.rating ?? 0);
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    const paginatedResults = results.slice(0, limit);

    return {
      data: paginatedResults,
      total: results.length,
      hasMore: results.length > limit,
    };
  } catch (error) {
    throw error;
  }
}
