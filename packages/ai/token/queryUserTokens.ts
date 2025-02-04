import { browserDb } from "database/browser/db";
import { TokenRecord } from "./types";
import { createTokenKey } from "database/keys";

export interface QueryParams {
  userId: string;
  startTime?: number; // 不传则查询当天
  model?: string;
  pageSize?: number;
  offset?: number;
}

export interface QueryResult {
  records: TokenRecord[];
  total: number;
}

/**
 * 查询用户token使用记录
 * @param params 查询参数，包含用户ID、起始时间（默认当天）、模型、分页参数
 * @returns 包含记录列表和总数的结果
 */
export const queryUserTokens = async (
  params: QueryParams
): Promise<QueryResult> => {
  const { userId, startTime, model, pageSize = 100, offset = 0 } = params;
  const { start, end } = createTokenKey.range(userId, startTime);
  const records: TokenRecord[] = [];
  let total = 0;

  try {
    // 先获取总数
    for await (const [_, value] of browserDb.iterator({
      gte: start,
      lte: end,
      reverse: true,
    })) {
      if (!model || value.model === model) {
        total++;
      }
    }

    // 再获取分页数据
    let count = 0;
    for await (const [_, value] of browserDb.iterator({
      gte: start,
      lte: end,
      reverse: true,
    })) {
      if (!model || value.model === model) {
        if (count >= offset) {
          records.push(value);
          if (records.length >= pageSize) break;
        }
        count++;
      }
    }

    return {
      records,
      total,
    };
  } catch (err) {
    throw err;
  }
};
