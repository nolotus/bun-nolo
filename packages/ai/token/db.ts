// ai/token/db.ts
import { browserDb } from "database/browser/db";
import { createTokenStatsKey, createTokenKey } from "database/keys";
import { TokenUsageData, TokenRecord } from "./types";
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
const enrichData = (data: TokenUsageData) => {
  const timestamp = Date.now();
  return {
    ...data,
    timestamp,
    id: ulid(timestamp),
    dateKey: format(timestamp, "yyyy-MM-dd"),
  };
};

const saveTokenRecord = async (data: TokenUsageData): Promise<TokenRecord> => {
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
  data: TokenUsageData,
  enrichedData: ReturnType<typeof enrichData>
) => {
  const key = createTokenStatsKey(data.userId, enrichedData.dateKey);

  try {
    const currentStats = await browserDb
      .get(key)
      .then((stats) =>
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

export const saveTokenUsage = async (data: TokenUsageData) => {
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
