// ai/token/db.ts
import { browserDb } from "database/browser/db";
import { curry } from "rambda";
import { createTokenStatsKey, createTokenKey } from "database/keys";
import { RequiredData, TokenRecord, TokenStats } from "./types";
import { ulid } from "ulid";
import { createTokenRecord } from "./record";
import { createInitialDayStats, updateDayStats } from "./stats";
import { format } from "date-fns";

// 统一错误处理
const handleDbError = (error: unknown, context: string) => {
  console.error({ error, context }, "Database operation failed");
  throw error;
};

// 提取公共的数据扩充逻辑
const enrichData = (data: RequiredData) => {
  const timestamp = Date.now();
  return {
    ...data,
    timestamp,
    id: ulid(timestamp),
    dateKey: format(timestamp, "yyyy-MM-dd"),
  };
};

const saveTokenRecord = async (data: RequiredData): Promise<TokenRecord> => {
  try {
    const enrichedData = enrichData(data);
    const record = createTokenRecord(enrichedData);
    const recordTimestamp = new Date(record.createdAt).getTime();
    const key = createTokenKey.record(data.userId, recordTimestamp);

    console.info(
      { key, timestamp: enrichedData.timestamp },
      "Saving token record"
    );
    await browserDb.put(key, record);

    return record;
  } catch (error) {
    handleDbError(error, "saveTokenRecord");
  }
};

const saveDayStats = async (
  data: RequiredData,
  enrichedData: ReturnType<typeof enrichData>
): Promise<TokenStats> => {
  const key = createTokenStatsKey(data.userId, enrichedData.dateKey);

  try {
    const currentStats = await browserDb
      .get(key)
      .then((stats: TokenStats) =>
        stats?.total
          ? stats
          : createInitialDayStats(data.userId, enrichedData.dateKey)
      )
      .catch(() => createInitialDayStats(data.userId, enrichedData.dateKey));

    const updatedStats = updateDayStats(data, currentStats);
    await browserDb.put(key, updatedStats);
    return updatedStats;
  } catch (error) {
    handleDbError(error, "saveDayStats");
  }
};

export const saveTokenUsage = async (data: RequiredData) => {
  try {
    const enrichedData = enrichData(data);
    const [record] = await Promise.all([
      saveTokenRecord(data),
      saveDayStats(data, enrichedData),
    ]);

    return {
      success: true,
      id: enrichedData.id,
      record,
    };
  } catch (error) {
    handleDbError(error, "saveTokenUsage");
  }
};

// 简化数据库遍历逻辑
const iterateDb = curry(
  async <T>(
    options: { gte: string; lte: string },
    filter: (value: T) => boolean
  ): Promise<T[]> => {
    const records: T[] = [];

    try {
      for await (const [_, value] of browserDb.iterator(options)) {
        if (filter(value)) {
          records.push(value);
        }
      }
      return records;
    } catch (error) {
      handleDbError(error, "iterateDb");
    }
  }
);
