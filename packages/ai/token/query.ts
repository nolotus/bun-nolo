import { pino } from "pino";
import { curry } from "rambda";
import { browserDb } from "database/browser/db";
import { TokenRecord } from "./types";
import { createTokenStatsKey, createTokenKey } from "database/keys";

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

const logger = pino({
  name: "token-db",
});

// 通用数据库迭代器
const iterateDb = curry(
  async <T>(options: any, filter: (v: T) => boolean): Promise<T[]> => {
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
      logger.error({ err }, "Failed to iterate db");
      throw err;
    }
  }
);

/**
 * 查询用户Token记录
 * @param params.userId - 用户ID
 * @param params.startTime - 查询开始时间 UTC timestamp
 * @param params.endTime - 查询结束时间 UTC timestamp
 * @param params.model - 可选的模型过滤
 * @param params.limit - 返回记录数限制,默认100
 * @param params.offset - 跳过记录数,默认0
 */
export const queryUserTokens = async (params: QueryParams) => {
  const { userId, startTime, endTime, model, limit = 100, offset = 0 } = params;

  try {
    logger.info(
      {
        userId,
        startTime: startTime ? new Date(startTime).toISOString() : undefined,
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
        model,
        limit,
        offset,
      },
      "Querying tokens"
    );

    const { start, end } = createTokenKey.range(userId, startTime);

    const records = await iterateDb<TokenRecord>({
      gte: start,
      lte: end,
      limit: limit + offset, // 修改 limit 来包含 offset
      offset: 0, // 修改 offset 来从头开始查询
      reverse: true,
    })((record) => !model || record.model === model);

    // 返回 offset 之后的记录
    const result = records.slice(offset, offset + limit);

    logger.debug(
      {
        startKey: start,
        endKey: end,
        count: result.length,
        offset,
        limit,
      },
      "Query completed"
    );

    return result;
  } catch (err) {
    logger.error({ err }, "Query failed");
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

  try {
    logger.info(
      {
        userId,
        startDate,
        endDate,
      },
      "Getting token stats"
    );

    // 统计数据按UTC日期(00:00:00)存储
    const startKey = createTokenStatsKey(userId, startDate);
    const endKey = createTokenStatsKey(userId, endDate);

    const records = await iterateDb<TokenStats>({
      gte: startKey,
      lte: endKey,
    })((record) => Boolean(record?.total));

    logger.debug(
      {
        startKey,
        endKey,
        recordCount: records.length,
      },
      "Stats query completed"
    );

    return records;
  } catch (error) {
    logger.error({ error }, "Failed to get token stats");
    throw error;
  }
};
