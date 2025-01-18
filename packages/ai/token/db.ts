import { createTokenStatsKey, createTokenKey } from "database/keys";
import { TokenUsageData, TokenRecord } from "./types";
import { ulid } from "ulid";
import { createTokenRecord } from "./record";
import { createInitialDayStats, updateDayStats } from "./stats";
import { format } from "date-fns";
import { pino } from "pino";
import { DataType } from "create/types";
import { read, write } from "database/dbSlice";

const logger = pino({ name: "token-db" });

const enrichData = (data: TokenUsageData) => {
  const timestamp = Date.now();
  return {
    ...data,
    timestamp,
    id: ulid(timestamp),
    dateKey: format(timestamp, "yyyy-MM-dd"),
  };
};

const saveTokenRecord = async (
  data: TokenUsageData,
  thunkApi
): Promise<TokenRecord> => {
  try {
    const enrichedData = enrichData(data);
    const record = createTokenRecord(enrichedData);
    const key = createTokenKey.record(data.userId, enrichedData.timestamp);

    logger.info(
      { key, timestamp: enrichedData.timestamp },
      "Saving token record"
    );

    await thunkApi.dispatch(
      write({
        data: {
          ...record,
          id: key,
          type: DataType.TOKEN,
        },
        customId: key,
      })
    );

    return record;
  } catch (error) {
    logger.error({ error }, "Failed to save token record");
    throw error;
  }
};

const saveDayStats = async (
  data: TokenUsageData,
  enrichedData: ReturnType<typeof enrichData>,
  thunkApi
) => {
  const key = createTokenStatsKey(data.userId, enrichedData.dateKey);

  try {
    const currentStats = await thunkApi
      .dispatch(read(key))
      .then((stats) =>
        stats?.total
          ? stats
          : createInitialDayStats(data.userId, enrichedData.dateKey)
      )
      .catch(() => createInitialDayStats(data.userId, enrichedData.dateKey));

    const updatedStats = updateDayStats(data, currentStats);

    await thunkApi.dispatch(
      write({
        data: {
          ...updatedStats,
          id: key,
          type: DataType.TOKEN,
        },
        customId: key,
      })
    );

    return updatedStats;
  } catch (error) {
    logger.error({ error }, "Failed to save day stats");
    throw error;
  }
};

export const saveTokenUsage = async (data: TokenUsageData, thunkApi) => {
  try {
    const enrichedData = enrichData(data);
    const [record] = await Promise.all([
      saveTokenRecord(data, thunkApi),
      saveDayStats(data, enrichedData, thunkApi),
    ]);

    return {
      success: true,
      id: enrichedData.id,
      record,
    };
  } catch (error) {
    logger.error({ error }, "Failed to save token usage");
    throw error;
  }
};
