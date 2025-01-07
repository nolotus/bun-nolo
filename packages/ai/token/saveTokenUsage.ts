import { DataType } from "create/types";
import { browserDb } from "database/browser/db";
import { ulid } from "ulid";
import { pipe, curry, prop } from "rambda";

// Types
interface TokenUsage {
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  input_tokens: number;
  cost: number;
}

interface RequiredData extends TokenUsage {
  userId: string;
  username: string;
  cybotId: string;
  modelName: string;
  provider: string;
  date: Date;
  type: DataType;
}

interface TokenRecord {
  id: string;
  userId: string;
  username: string;
  cybotId: string;
  model: string;
  provider: string;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  input_tokens: number;
  cost: number;
  createdAt: number;
}

interface ModelStats {
  count: number;
  tokens: number;
  cost: number;
}

interface DayStats {
  userId: string;
  period: "day";
  timeKey: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  models: Record<string, ModelStats>;
  providers: Record<string, ModelStats>;
  count: number;
}

// Utils
const generateId = pipe(prop("timestamp"), ulid);

const formatDate = pipe(
  prop("timestamp"),
  (t: number) => new Date(t).toISOString().split("T")[0]
);

const createKey = (...parts: string[]) => parts.join(":");

// Key generators
const createRecordKey = curry((userId: string, id: string) =>
  createKey("token", userId, id)
);

const createDayStatsKey = curry((userId: string, dateKey: string) =>
  createKey("token", "stats", "day", userId, dateKey)
);

// Data transformers
const enrichData = (data: RequiredData) => ({
  ...data,
  timestamp: data.date.getTime(),
  id: ulid(data.date.getTime()),
  dateKey: formatDate({ timestamp: data.date.getTime() }),
});

const toTokenRecord = (data: ReturnType<typeof enrichData>): TokenRecord => ({
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

// Stats operations
const createInitialDayStats = curry(
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

const updateModelStats = curry(
  (data: RequiredData, stats = { count: 0, tokens: 0, cost: 0 }) => ({
    count: stats.count + 1,
    tokens: stats.tokens + data.input_tokens + data.output_tokens,
    cost: stats.cost + data.cost,
  })
);

const updateDayStats = curry(
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

// DB operations
const safeDbGet = curry(
  <T>(defaultValue: T, key: string): Promise<T> =>
    browserDb.get(key).catch(() => defaultValue)
);

const dbPut = curry(async (key: string, value: any) => {
  await browserDb.put(key, value);
  return value;
});

// Composed operations
const saveRecord = async (data: RequiredData) => {
  const enrichedData = enrichData(data);
  const record = toTokenRecord(enrichedData);
  const key = createRecordKey(data.userId, enrichedData.id);
  return dbPut(key, record);
};

const saveDayStats = curry(async (data: RequiredData, enrichedData) => {
  const key = createDayStatsKey(data.userId, enrichedData.dateKey);
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

// Query operations
const createTimeRange = curry(
  (userId: string, startTime?: number, endTime?: number) => ({
    startKey: startTime
      ? createRecordKey(userId, ulid(startTime))
      : createRecordKey(userId, ""),
    endKey: endTime
      ? createRecordKey(userId, ulid(endTime))
      : createRecordKey(userId, "\uffff"),
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

interface QueryParams {
  userId: string;
  startTime?: number;
  endTime?: number;
  model?: string;
  provider?: string;
  limit?: number;
}

interface StatsParams {
  userId: string;
  period: "day";
  startDate: string;
  endDate: string;
}

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
    const startKey = createDayStatsKey(userId)(startDate);
    const endKey = createDayStatsKey(userId)(endDate);

    return iterateDb({
      gte: startKey,
      lte: endKey,
    })(() => true);
  } catch (error) {
    console.error("Error getting token stats:", error);
    throw error;
  }
};
