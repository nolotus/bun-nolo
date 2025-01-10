import { RequiredData } from "./types";
import { createTokenStatsKey } from "database/keys";
import { browserDb } from "database/browser/db";
import pino from "pino";

const logger = pino({
  level: "debug",
  name: "stats-service",
  timestamp: true,
});

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
  total: {
    count: number;
    tokens: TokenCount;
    cost: number;
  };
  models: Record<string, ModelStats>;
  providers: Record<string, ModelStats>;
}

function updateModelStats(
  data: RequiredData,
  stats: ModelStats = {
    count: 0,
    tokens: { input: 0, output: 0 },
    cost: 0,
  }
): ModelStats {
  logger.debug({
    msg: "Updating model stats",
    input: { data, stats },
  });

  const updated = {
    count: stats.count + 1,
    tokens: {
      input: stats.tokens.input + data.input_tokens,
      output: stats.tokens.output + data.output_tokens,
    },
    cost: stats.cost + data.cost,
  };

  logger.debug({
    msg: "Model stats updated",
    output: updated,
  });
  return updated;
}

function createInitialDayStats(userId: string, dateKey: string): DayStats {
  const initial = {
    userId,
    period: "day",
    timeKey: dateKey,
    total: {
      count: 0,
      tokens: {
        input: 0,
        output: 0,
      },
      cost: 0,
    },
    models: {},
    providers: {},
  };

  logger.debug({
    msg: "Created initial day stats",
    stats: initial,
  });
  return initial;
}

function updateDayStats(data: RequiredData, stats: DayStats): DayStats {
  logger.debug({
    msg: "Updating day stats",
    input: { data, stats },
  });

  // 清理无效的model keys
  const cleanModels = { ...stats.models };
  if ("unknown" in cleanModels) {
    delete cleanModels.unknown;
    logger.debug("Removed 'unknown' from models");
  }
  if ("undefined" in cleanModels) {
    delete cleanModels.undefined;
    logger.debug("Removed 'undefined' from models");
  }

  const modelName = data.model || "unknown";
  const providerName = data.provider || "unknown";

  logger.debug({
    msg: "Using model and provider",
    model: modelName,
    provider: providerName,
  });

  const updated = {
    ...stats,
    total: {
      count: stats.total.count + 1,
      tokens: {
        input: stats.total.tokens.input + data.input_tokens,
        output: stats.total.tokens.output + data.output_tokens,
      },
      cost: stats.total.cost + data.cost,
    },
    models: {
      ...cleanModels,
      [modelName]: updateModelStats(data, cleanModels[modelName]),
    },
    providers: {
      ...stats.providers,
      [providerName]: updateModelStats(data, stats.providers[providerName]),
    },
  };

  logger.debug({
    msg: "Day stats updated",
    output: updated,
  });
  return updated;
}

export async function saveDayStats(data: RequiredData, enrichedData) {
  const key = createTokenStatsKey(data.userId, enrichedData.dateKey);

  try {
    if (!data.model) {
      logger.warn({ msg: "Model is undefined, using unknown", data });
    }
    if (!data.provider) {
      logger.warn({ msg: "Provider is undefined, using unknown", data });
    }

    // 获取或创建当天统计
    const currentStats = await browserDb
      .get(key)
      .then((stats) => {
        if (!stats.total) {
          logger.info({ msg: "Found old format stats, creating new one" });
          return createInitialDayStats(data.userId, enrichedData.dateKey);
        }
        return stats;
      })
      .catch(() => createInitialDayStats(data.userId, enrichedData.dateKey));

    const updatedStats = updateDayStats(data, currentStats);
    await browserDb.put(key, updatedStats);
    return updatedStats;
  } catch (err) {
    logger.error({
      msg: "Error saving stats",
      error: err,
      data,
      enrichedData,
    });
    throw err;
  }
}
