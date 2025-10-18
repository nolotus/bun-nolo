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

function toNumber(n: unknown, fallback: number) {
  const v = typeof n === "number" ? n : parseFloat(String(n));
  return Number.isFinite(v) ? v : fallback;
}

function toTimeMs(t: unknown) {
  if (typeof t === "number") return t;
  const n = Date.parse(String(t ?? 0));
  return Number.isFinite(n) ? n : 0;
}

export async function fetchPublicAgents(
  options: FetchPublicAgentsOptions = {}
) {
  const { limit = 20, sortBy = "newest", searchName } = options;

  try {
    const { start, end } = pubAgentKeys.list();
    let results: Agent[] = [];

    for await (const [, value] of browserDb.iterator({
      gte: start,
      lte: end,
    })) {
      if (value?.isPublic) results.push(value as Agent);
    }

    if (searchName) {
      const kw = searchName.toLowerCase();
      results = results.filter((agent) =>
        agent.name?.toLowerCase().includes(kw)
      );
    }

    results.sort((a, b) => {
      let diff = 0;
      switch (sortBy) {
        case "popular": {
          const ua = toNumber(
            (a as any).metrics?.useCount ?? (a as any).dialogCount,
            0
          );
          const ub = toNumber(
            (b as any).metrics?.useCount ?? (b as any).dialogCount,
            0
          );
          diff = ub - ua;
          break;
        }
        case "rating": {
          const ra = toNumber(
            (a as any).metrics?.rating ?? (a as any).messageCount,
            0
          );
          const rb = toNumber(
            (b as any).metrics?.rating ?? (b as any).messageCount,
            0
          );
          diff = rb - ra;
          break;
        }
        case "outputPriceAsc": {
          const pa = toNumber((a as any).outputPrice, Number.POSITIVE_INFINITY);
          const pb = toNumber((b as any).outputPrice, Number.POSITIVE_INFINITY);
          diff = pa - pb;
          break;
        }
        case "outputPriceDesc": {
          const pa = toNumber((a as any).outputPrice, Number.NEGATIVE_INFINITY);
          const pb = toNumber((b as any).outputPrice, Number.NEGATIVE_INFINITY);
          diff = pb - pa;
          break;
        }
        case "newest":
        default: {
          const ta = toTimeMs((a as any).createdAt);
          const tb = toTimeMs((b as any).createdAt);
          diff = tb - ta;
          break;
        }
      }
      if (diff !== 0) return diff;
      return String(a.id).localeCompare(String(b.id));
    });

    const paginatedResults = results.slice(0, limit);

    logger.debug(
      {
        total: results.length,
        returned: paginatedResults.length,
        sortBy,
        limit,
        firstItemCreatedAt: paginatedResults[0]?.createdAt,
      },
      "Fetched public agents (local)"
    );

    return {
      data: paginatedResults,
      total: results.length,
      hasMore: limit < results.length,
    };
  } catch (error) {
    logger.error({ error }, "Failed to fetch public agents (local)");
    throw error;
  }
}
