import { pino } from "pino";
import { curry } from "rambda";
import { browserDb } from "database/browser/db";
import { TokenRecord, QueryParams } from "./types";
import { createTokenKey } from "database/keys";

const logger = pino({
  name: "token-db",
});

// 优化迭代器函数
const iterateDb = curry(async (options: any, filter: (v: any) => boolean) => {
  const records: TokenRecord[] = [];
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
});

export const queryUserTokens = async (params: QueryParams) => {
  const { userId, startTime, endTime, model, limit = 100 } = params;

  try {
    logger.info({ userId, startTime, endTime }, "Querying tokens");

    const { start, end } = createTokenKey.range(userId, startTime);

    const records = await iterateDb({
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
