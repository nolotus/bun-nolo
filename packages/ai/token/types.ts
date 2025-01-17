// ai/token/types.ts

export const DEFAULT_QUERY_LIMIT = 100;

export const TOKEN_PERIODS = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
} as const;

export const TOKEN_SCOPES = {
  USER: "user",
  CYBOT: "cybot",
  SITE: "site",
} as const;

// 原始用量类型
export interface RawUsageType1 {
  output_tokens?: number;
  input_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export interface RawUsageType2 {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_cache_hit_tokens: number;
  prompt_cache_miss_tokens: number;
}

export type RawUsage = RawUsageType1 | RawUsageType2;

// 标准化后的用量数据
export interface NormalizedUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  cost: number;
}

// Token使用数据
export interface TokenUsageData extends NormalizedUsage {
  userId?: string;
  cybotId: string;
  model: string;
  provider: string;
  dialogId: string;
  pay: any; // TODO: 明确支付数据类型
}

// Token记录
export interface TokenRecord {
  id: string;
  userId: string;
  username: string;
  cybotId: string;
  model: string;
  provider: string;
  dialogId: string;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  input_tokens: number;
  cost: number;
  pay: any;
  createdAt: number; // UTC timestamp
  type: string;
}

// Token统计数据
export interface TokenStats {
  total: number;
  date: string; // YYYY-MM-DD in UTC
  inputTokens: number;
  outputTokens: number;
  cost: number;
  userId: string;
  createdAt: number; // UTC timestamp
  type: string;
}
