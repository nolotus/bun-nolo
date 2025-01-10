// 3. ai/token/db.ts - 数据库操作和查询相关
import { browserDb } from "database/browser/db";
import { curry } from "rambda";
import { createTokenRecordKey, createTokenStatsKey } from "database/keys";
import { RequiredData, TokenRecord, QueryParams, StatsParams } from "./types";
import {
  enrichData,
  toTokenRecord,
  createInitialDayStats,
  updateDayStats,
} from "./utils";

// Base DB operations
export const safeDbGet = curry(
  <T>(defaultValue: T, key: string): Promise<T> =>
    browserDb.get(key).catch(() => defaultValue)
);

export const dbPut = curry(async (key: string, value: any) => {
  await browserDb.put(key, value);
  return value;
});

// Query helpers
const createTimeRange = curry(
  (userId: string, startTime?: number, endTime?: number) => ({
    startKey: startTime
      ? createTokenRecordKey(userId, ulid(startTime))
      : createTokenRecordKey(userId, ""),
    endKey: endTime
      ? createTokenRecordKey(userId, ulid(endTime))
      : createTokenRecordKey(userId, "\uffff"),
  })
);

const createFilter = curry(
  (model: string | undefined, provider: string | undefined) =>
    (record: TokenRecord) =>
      (!model || record.model === model) &&
      (!provider || record.provider === provider)
);

const iterateDb = curry(async (options: any, filter: Function) => {
  const records = [];
  for await (const [_, value] of browserDb.iterator(options)) {
    if (filter(value)) {
      records.push(value);
    }
  }
  return records;
});

// Record operations
const saveRecord = async (data: RequiredData) => {
  const enrichedData = enrichData(data);
  const record = toTokenRecord(enrichedData);
  const key = createTokenRecordKey(data.userId, enrichedData.id);
  return dbPut(key, record);
};

const saveDayStats = curry(async (data: RequiredData, enrichedData) => {
  const key = createTokenStatsKey(data.userId, enrichedData.dateKey);
  const defaultStats = createInitialDayStats(data.userId, enrichedData.dateKey);
  const currentStats = await safeDbGet(defaultStats, key);
  return dbPut(key, updateDayStats(data)(currentStats));
});

// Main functions
export const saveTokenUsage = async (data: RequiredData) => {
  try {
    const enrichedData = enrichData(data);
    const [record] = await Promise.all([
      saveRecord(data),
      saveDayStats(data, enrichedData),
    ]);

    return {
      success: true,
      id: enrichedData.id,
      record,
    };
  } catch (error) {
    console.error("Error saving token usage:", error);
    throw error;
  }
};

export const queryUserTokens = async (params: QueryParams) => {
  const { userId, startTime, endTime, model, provider, limit = 100 } = params;

  try {
    const { startKey, endKey } = createTimeRange(userId)(startTime)(endTime);
    const filter = createFilter(model)(provider);

    return iterateDb({
      gte: startKey,
      lte: endKey,
      limit,
      reverse: true,
    })(filter);
  } catch (error) {
    console.error("Error querying tokens:", error);
    throw error;
  }
};

export const getTokenStats = async (params: StatsParams) => {
  const { userId, startDate, endDate } = params;

  try {
    const startKey = createTokenStatsKey(userId)(startDate);
    const endKey = createTokenStatsKey(userId)(endDate);

    return iterateDb({
      gte: startKey,
      lte: endKey,
    })(() => true);
  } catch (error) {
    console.error("Error getting token stats:", error);
    throw error;
  }
};
