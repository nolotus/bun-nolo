import { createTokenStatsKey } from "database/keys";
import { TokenUsageData } from "./types";
import { ulid } from "ulid";
import { createInitialDayStats } from "./stats";
import { format } from "date-fns";
import { pino } from "pino";
import { DataType } from "create/types";
import { read, write } from "database/dbSlice";

interface TokenCount {
  input: number;
  output: number;
}

interface ModelStats {
  count: number;
  tokens: TokenCount;
  cost: number;
}

interface DayStats {
  userId: string;
  period: "day";
  timeKey: string;
  total: { count: number; tokens: TokenCount; cost: number };
  models: Record<string, ModelStats>;
  providers: Record<string, ModelStats>;
}

const logger = pino({ name: "token-db" });

const enrichData = (data: TokenUsageData) => ({
  ...data,
  timestamp: Date.now(),
  id: ulid(Date.now()),
  dateKey: format(Date.now(), "yyyy-MM-dd"),
});

const updateStats = (
  data: TokenUsageData,
  stats: ModelStats = { count: 0, tokens: { input: 0, output: 0 }, cost: 0 }
) => ({
  count: stats.count + 1,
  tokens: {
    input: stats.tokens.input + data.input_tokens,
    output: stats.tokens.output + data.output_tokens,
  },
  cost: stats.cost + data.cost,
});

const updateDayStats = (data: TokenUsageData, stats: DayStats) => {
  const cleanModels = { ...stats.models };
  ["unknown", "undefined"].forEach((key) => delete cleanModels[key]);

  const modelName = data.model || "unknown";
  const providerName = data.provider || "unknown";

  const updatedStats = {
    ...stats,
    total: updateStats(data, stats.total),
    models: {
      ...cleanModels,
      [modelName]: updateStats(data, cleanModels[modelName]),
    },
    providers: {
      ...stats.providers,
      [providerName]: updateStats(data, stats.providers[providerName]),
    },
  };

  logger.info({ updatedStats }, "Updated day stats");
  return updatedStats;
};

const saveDayStats = async (
  data: TokenUsageData,
  enrichedData: ReturnType<typeof enrichData>,
  thunkApi
) => {
  const key = createTokenStatsKey(data.userId, enrichedData.dateKey);

  try {
    const currentStats = await thunkApi.dispatch(read(key)).unwrap();
    const stats = currentStats?.total
      ? currentStats
      : createInitialDayStats(data.userId, enrichedData.dateKey);
    const updatedStats = updateDayStats(data, stats);

    await thunkApi.dispatch(
      write({
        data: { ...updatedStats, id: key, type: DataType.TOKEN },
        customId: key,
      })
    );
    logger.info({ currentStats, updatedStats }, "Saved day stats");
    return updatedStats;
  } catch (error) {
    logger.error({ error }, "Failed to save day stats");
    throw error;
  }
};

export const saveTokenUsage = async (data: TokenUsageData, thunkApi) => {
  try {
    const enrichedData = enrichData(data);
    const record = await saveDayStats(data, enrichedData, thunkApi);
    return { success: true, id: enrichedData.id, record };
  } catch (error) {
    logger.error({ error }, "Failed to save token usage");
    throw error;
  }
};
