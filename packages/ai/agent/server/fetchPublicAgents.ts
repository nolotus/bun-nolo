import serverDb from "database/server/db";
import { pubAgentKeys } from "database/keys";
import { Agent } from "app/types";

export interface FetchPublicAgentsOptions {
  limit?: number;
  sortBy?:
    | "newest"
    | "popular"
    | "rating"
    | "outputPriceAsc"
    | "outputPriceDesc";
  searchName?: string;
}

export interface FetchPublicAgentsResult {
  data: Agent[];
  total: number;
  hasMore: boolean;
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

async function dbList<T>(
  gte: string,
  lte: string,
  filter?: (v: T) => boolean
): Promise<T[]> {
  const res: T[] = [];
  for await (const [, value] of serverDb.iterator({ gte, lte })) {
    if (!filter || filter(value as T)) res.push(value as T);
  }
  return res;
}

export async function fetchPublicAgents(
  options: FetchPublicAgentsOptions = {}
): Promise<FetchPublicAgentsResult> {
  const { limit = 20, sortBy = "newest", searchName } = options;
  const { start, end } = pubAgentKeys.list();

  let list = await dbList<Agent>(start, end, (v) => (v as any).isPublic);

  if (searchName) {
    const kw = searchName.toLowerCase();
    list = list.filter((agent) => agent.name?.toLowerCase().includes(kw));
  }

  list.sort((a, b) => {
    let diff = 0;
    switch (sortBy) {
      case "popular": {
        const ua = toNumber((a as any).metrics?.useCount, 0);
        const ub = toNumber((b as any).metrics?.useCount, 0);
        diff = ub - ua;
        break;
      }
      case "rating": {
        const ra = toNumber((a as any).metrics?.rating, 0);
        const rb = toNumber((b as any).metrics?.rating, 0);
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

  const data = list.slice(0, limit);
  return { data, total: list.length, hasMore: list.length > limit };
}
