// 2. ai/token/utils.ts - 工具函数和数据转换
import { pipe, curry, prop } from "rambda";
import { ulid } from "ulid";
import { RequiredData, TokenRecord, DayStats, ModelStats } from "./types";

export const generateId = pipe(prop("timestamp"), ulid);

export const formatDate = pipe(
  prop("timestamp"),
  (t: number) => new Date(t).toISOString().split("T")[0]
);

export const enrichData = (data: RequiredData) => ({
  ...data,
  timestamp: data.date.getTime(),
  id: ulid(data.date.getTime()),
  dateKey: formatDate({ timestamp: data.date.getTime() }),
});

export const toTokenRecord = (
  data: ReturnType<typeof enrichData>
): TokenRecord => ({
  id: data.id,
  userId: data.userId,
  username: data.username,
  cybotId: data.cybotId,
  model: data.modelName,
  provider: data.provider,
  cache_creation_input_tokens: data.cache_creation_input_tokens,
  cache_read_input_tokens: data.cache_read_input_tokens,
  output_tokens: data.output_tokens,
  input_tokens: data.input_tokens,
  cost: data.cost,
  createdAt: data.timestamp,
});

export const createInitialDayStats = curry(
  (userId: string, dateKey: string): DayStats => ({
    userId,
    period: "day",
    timeKey: dateKey,
    total_input_tokens: 0,
    total_output_tokens: 0,
    total_cost: 0,
    models: {},
    providers: {},
    count: 0,
  })
);

export const updateModelStats = curry(
  (
    data: RequiredData,
    stats: ModelStats = { count: 0, tokens: 0, cost: 0 }
  ) => ({
    count: stats.count + 1,
    tokens: stats.tokens + data.input_tokens + data.output_tokens,
    cost: stats.cost + data.cost,
  })
);

export const updateDayStats = curry(
  (data: RequiredData, stats: DayStats): DayStats => ({
    ...stats,
    total_input_tokens: stats.total_input_tokens + data.input_tokens,
    total_output_tokens: stats.total_output_tokens + data.output_tokens,
    total_cost: stats.total_cost + data.cost,
    count: stats.count + 1,
    models: {
      ...stats.models,
      [data.modelName]: updateModelStats(data)(stats.models[data.modelName]),
    },
    providers: {
      ...stats.providers,
      [data.provider]: updateModelStats(data)(stats.providers[data.provider]),
    },
  })
);
