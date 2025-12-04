import { browserDb } from "database/browser/db";
import { createTokenStatsKey } from "database/keys";

export interface QueryParams {
  userId: string;
  startTime?: number; // UTC timestamp
  endTime?: number; // UTC timestamp
  model?: string;
  limit?: number;
  offset?: number;
}

export interface TokenStats {
  total: number;
  date: string; // UTC YYYY-MM-DD
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface StatsParams {
  userId: string;
  period: "day";
  startDate: string; // UTC YYYY-MM-DD
  endDate: string; // UTC YYYY-MM-DD
}

// 通用数据库迭代器（不再使用 curry）
const iterateDb = async <T>(
  options: any,
  filter: (v: T) => boolean
): Promise<T[]> => {
  const records: T[] = [];
  const { offset = 0, limit } = options;
  let count = 0;

  try {
    for await (const [_, value] of browserDb.iterator(options)) {
      if (filter(value)) {
        if (count >= offset) {
          records.push(value);
          if (limit && records.length >= limit) {
            break;
          }
        }
        count++;
      }
    }
    return records;
  } catch (err) {
    throw err;
  }
};

/**
 * 获取Token统计数据
 * @param params.userId - 用户ID
 * @param params.startDate - 开始日期 YYYY-MM-DD (UTC)
 * @param params.endDate - 结束日期 YYYY-MM-DD (UTC)
 * @param params.period - 统计周期,目前支持 "day"
 */
export const getTokenStats = async (
  params: StatsParams
): Promise<TokenStats[]> => {
  const { userId, startDate, endDate } = params;

  // 统计数据按UTC日期(00:00:00)存储
  const startKey = createTokenStatsKey(userId, startDate);
  const endKey = createTokenStatsKey(userId, endDate);

  const records = await iterateDb<TokenStats>(
    {
      gte: startKey,
      lte: endKey,
    },
    (record) => Boolean(record?.total)
  );

  return records;
};
