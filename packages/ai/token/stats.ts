import { TokenUsageData } from "./types";

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
  data: TokenUsageData,
  stats: ModelStats = {
    count: 0,
    tokens: { input: 0, output: 0 },
    cost: 0,
  }
): ModelStats {
  const updated = {
    count: stats.count + 1,
    tokens: {
      input: stats.tokens.input + data.input_tokens,
      output: stats.tokens.output + data.output_tokens,
    },
    cost: stats.cost + data.cost,
  };
  return updated;
}

export function createInitialDayStats(
  userId: string,
  dateKey: string
): DayStats {
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
  return initial;
}

export function updateDayStats(
  data: TokenUsageData,
  stats: DayStats
): DayStats {
  // 清理无效的model keys
  const cleanModels = { ...stats.models };
  if ("unknown" in cleanModels) {
    delete cleanModels.unknown;
  }
  if ("undefined" in cleanModels) {
    delete cleanModels.undefined;
  }

  const modelName = data.model || "unknown";
  const providerName = data.provider || "unknown";

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

  return updated;
}
