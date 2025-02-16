import { TokenUsageData } from "ai/token/types";
import { DataType } from "create/types";
import { extractUserId } from "core/prefix";
import { normalizeUsage } from "ai/token/normalizeUsage";
import { calculatePrice } from "ai/token/calculatePrice";
import { createTokenStatsKey } from "database/keys";
import { ulid } from "ulid";
import { format } from "date-fns";
import { write, read } from "database/dbSlice";
import toast from "react-hot-toast";
import {
  createTokenRecord,
  saveTokenRecord,
  ModelStats,
} from "ai/token/saveTokenRecord";
import { pino } from "pino";

const logger = pino({ name: "token-usage", level: "info" });

interface DayStats {
  userId: string;
  period: "day";
  timeKey: string;
  total: ModelStats;
  models: Record<string, ModelStats>;
  providers: Record<string, ModelStats>;
}

const updateStatsCounter = (
  data: TokenUsageData,
  stats: ModelStats = { count: 0, tokens: { input: 0, output: 0 }, cost: 0 }
): ModelStats => ({
  count: stats.count + 1,
  tokens: {
    input: stats.tokens.input + data.input_tokens,
    output: stats.tokens.output + data.output_tokens,
  },
  cost: stats.cost + data.cost,
});

const updateStats = async (
  data: TokenUsageData,
  existingStats: DayStats | null,
  key: string,
  thunkApi
) => {
  try {
    const stats = existingStats ?? {
      userId: data.userId,
      period: "day",
      timeKey: format(Date.now(), "yyyy-MM-dd"),
      total: { count: 0, tokens: { input: 0, output: 0 }, cost: 0 },
      models: {},
      providers: {},
    };

    const modelName = data.model || "unknown";
    const providerName = data.provider || "unknown";

    const cleanModels = Object.fromEntries(
      Object.entries(stats.models).filter(
        ([key]) => !["unknown", "undefined"].includes(key)
      )
    );

    const updatedStats = {
      ...stats,
      total: updateStatsCounter(data, stats.total),
      models: {
        ...cleanModels,
        [modelName]: updateStatsCounter(data, cleanModels[modelName]),
      },
      providers: {
        ...stats.providers,
        [providerName]: updateStatsCounter(data, stats.providers[providerName]),
      },
    };

    await thunkApi.dispatch(
      write({
        data: { ...updatedStats, id: key, type: DataType.TOKEN },
        customKey: key,
      })
    );

    return updatedStats;
  } catch (error) {
    logger.error(
      { key, userId: data.userId, error: error.message },
      "Failed to update token stats"
    );
    toast.error("Failed to update token stats");
    throw error;
  }
};

export const saveTokenUsage = async (data: TokenUsageData, thunkApi) => {
  const dateKey = format(Date.now(), "yyyy-MM-dd");
  const key = createTokenStatsKey(data.userId, dateKey);

  try {
    let currentStats = null;
    try {
      currentStats = await thunkApi.dispatch(read(key)).unwrap();
    } catch (err) {
      logger.warn({ key }, "No existing stats found");
    }

    const updatedStats = await updateStats(data, currentStats, key, thunkApi);

    return {
      success: true,
      id: ulid(Date.now()),
      record: updatedStats,
    };
  } catch (error) {
    logger.error(
      {
        key,
        userId: data.userId,
        error: error.message,
        tokenData: {
          input: data.input_tokens,
          output: data.output_tokens,
          model: data.model,
        },
      },
      "Failed to process token usage"
    );

    toast.error("Failed to process token usage");
    throw error;
  }
};

export const updateTokensAction = async (
  { dialogId, usage: usageRaw, cybotConfig },
  thunkApi
) => {
  const { currentUser } = thunkApi.getState().auth;
  const usage = normalizeUsage(usageRaw);
  const timestamp = Date.now();

  const result = calculatePrice({
    provider: cybotConfig.provider,
    modelName: cybotConfig.model,
    usage,
    externalPrice: {
      input: cybotConfig.inputPrice,
      output: cybotConfig.outputPrice,
      creatorId: extractUserId(cybotConfig.id),
    },
  });

  const tokenData: TokenUsageData = {
    ...usage,
    userId: currentUser?.userId,
    username: currentUser?.username,
    cybotId: cybotConfig.id,
    model: cybotConfig.model,
    provider: cybotConfig.provider,
    type: DataType.TOKEN,
    dialogId,
    cost: result.cost,
    pay: result.pay,
    timestamp,
    id: ulid(timestamp),
    dateKey: format(timestamp, "yyyy-MM-dd"),
  };

  const record = createTokenRecord(tokenData, {
    cost: result.cost,
    inputPrice: cybotConfig.inputPrice,
    outputPrice: cybotConfig.outputPrice,
  });

  await saveTokenRecord(tokenData, record, thunkApi);
  await saveTokenUsage(tokenData, thunkApi);

  return {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
  };
};
