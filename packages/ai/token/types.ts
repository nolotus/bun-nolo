import { DataType } from "create/types";

// 1. ai/token/types.ts - 包含所有类型定义和常量
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

export interface TokenUsage {
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  input_tokens: number;
  cost: number;
}

export interface RequiredData extends TokenUsage {
  dialogId: string;
  userId: string;
  username: string;
  cybotId: string;
  model: string;
  provider: string;
  date: Date;
  type: DataType.Token;
}

export interface NormalizedUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  cost: number;
}

export interface TokenUsageData extends NormalizedUsage {
  userId?: string;
  cybotId: string;
  model: string;
  provider: string;
  date: Date;
  type: string;
  dialogId: string;
}

export interface TokenRecord {
  id: string;
  userId: string;
  username: string;
  cybotId: string;
  model: string;
  provider: string;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  output_tokens?: number;
  input_tokens?: number;
  cost: number;
  createdAt: number;
}
