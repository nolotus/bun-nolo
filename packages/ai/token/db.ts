// 3. ai/token/db.ts - 数据库操作和查询相关
import { browserDb } from "database/browser/db";
import { curry } from "rambda";
import { createTokenStatsKey } from "database/keys";
import { RequiredData, StatsParams } from "./types";
import { saveTokenRecord } from "./record";
import { saveDayStats } from "./stats";
import { ulid } from "ulid";

const formatDateKey = (date: Date): string => date.toISOString().split("T")[0];

const enrichData = (data) => {
  const timestamp = data.date.getTime();
  return {
    ...data,
    timestamp,
    id: ulid(timestamp),
    dateKey: formatDateKey(data.date),
  };
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
    console.error("Error saving token usage:", error);
    throw error;
  }
};

const iterateDb = curry(async (options: any, filter: Function) => {
  const records = [];
  for await (const [_, value] of browserDb.iterator(options)) {
    if (filter(value)) {
      records.push(value);
    }
  }
  return records;
});

export const getTokenStats = async (params: StatsParams) => {
  const { userId, startDate, endDate } = params;

  try {
    const startKey = createTokenStatsKey(userId, startDate);
    const endKey = createTokenStatsKey(userId, endDate);

    const records = await iterateDb({
      gte: startKey,
      lte: endKey,
    })(() => true);

    return records.filter((record) => record.total); // 确保只返回有效的统计记录
  } catch (error) {
    throw error;
  }
};
