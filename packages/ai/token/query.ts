// ai/token/db.ts
import { pino } from "pino";
import { curry } from "rambda";
import { browserDb } from "database/browser/db";
import { QueryParams } from "./types";
import { RequiredData, StatsParams, TokenRecord, TokenStats } from "./types";
import { createTokenStatsKey, createTokenKey } from "database/keys";

const logger = pino({
  name: "token-db",
});

// 通用数据库迭代器
const iterateDb = curry(
  async <T>(options: any, filter: (v: T) => boolean): Promise<T[]> => {
    const records: T[] = [];
    try {
      for await (const [_, value] of browserDb.iterator(options)) {
        if (filter(value)) {
          records.push(value);
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
 * @param userId - 用户ID
 * @param startTime - 查询开始时间 UTC timestamp
 * @param endTime - 查询结束时间 UTC timestamp
 * @param model - 可选的模型过滤
 * @param limit - 返回记录数限制,默认100
 */
export const queryUserTokens = async (params: QueryParams) => {
  const { userId, startTime, endTime, model, limit = 100 } = params;

  try {
    logger.info({ userId, startTime, endTime }, "Querying tokens");

    // createTokenKey.range 会处理UTC时间范围
    const { start, end } = createTokenKey.range(userId, startTime);

    const records = await iterateDb<TokenRecord>({
      gte: start,
      lte: end,
      limit,
      reverse: true,
    })((record) => !model || record.model === model);

    logger.debug(
      {
        startKey: start,
        endKey: end,
        count: records.length,
      },
      "Query completed"
    );

    return records;
  } catch (err) {
    logger.error({ err }, "Query failed");
    throw err;
  }
};

/**
 * 获取Token统计数据
 * @param userId - 用户ID
 * @param startDate - 开始日期 YYYY-MM-DD (UTC)
 * @param endDate - 结束日期 YYYY-MM-DD (UTC)
 */
export const getTokenStats = async (
  params: StatsParams
): Promise<TokenStats[]> => {
  const { userId, startDate, endDate } = params;

  try {
    // 统计数据按UTC日期(00:00:00)存储
    const startKey = createTokenStatsKey(userId, startDate);
    const endKey = createTokenStatsKey(userId, endDate);

    const records = await iterateDb<TokenStats>({
      gte: startKey,
      lte: endKey,
    })((record) => Boolean(record?.total));

    return records;
  } catch (error) {
    logger.error({ error }, "Failed to get token stats");
    throw error;
  }
};
