// ai/agent/server/fetchPublicAgents.ts

import serverDb from "database/server/db";
import { pubAgentKeys } from "database/keys"; // 假设 'pubCybotKeys' 已重命名为 'pubAgentKeys'
import { Agent } from "app/types";

/**
 * 获取公开 Agent 列表的选项
 */
export interface FetchPublicAgentsOptions {
  limit?: number;
  sortBy?:
    | "newest"
    | "popular"
    | "rating"
    | "outputPriceAsc"
    | "outputPriceDesc";
}

/**
 * 获取公开 Agent 列表的返回结果
 */
export interface FetchPublicAgentsResult {
  data: Agent[];
  total: number;
  hasMore: boolean;
}

// 通用的数据库列表迭代函数
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

/**
 * 从数据库获取公开的 Agent 列表，支持排序和分页
 * @param options - 查询选项，如 limit 和 sortBy
 * @returns 返回 Agent 列表、总数和是否有更多数据
 */
export async function fetchPublicAgents(
  options: FetchPublicAgentsOptions = {}
): Promise<FetchPublicAgentsResult> {
  const { limit = 20, sortBy = "newest" } = options;
  const { start, end } = pubAgentKeys.list();
  const list = await dbList<Agent>(start, end, (v) => v.isPublic);

  // 根据 sortBy 参数对列表进行排序
  list.sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.metrics?.useCount ?? 0) - (a.metrics?.useCount ?? 0);
      case "rating":
        return (b.metrics?.rating ?? 0) - (a.metrics?.rating ?? 0);
      case "outputPriceAsc":
        return (a.outputPrice ?? Infinity) - (b.outputPrice ?? Infinity);
      case "outputPriceDesc":
        return (b.outputPrice ?? -Infinity) - (a.outputPrice ?? -Infinity);
      case "newest":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  const data = list.slice(0, limit);
  return { data, total: list.length, hasMore: list.length > limit };
}
