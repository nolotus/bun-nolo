import { RawUsage, NormalizedUsage } from "./types";

/**
 * 规范化 usage 数据
 */
export const normalizeUsage = (usage: RawUsage): NormalizedUsage => {
  const inputTokens =
    "input_tokens" in usage
      ? usage.input_tokens
      : "prompt_tokens" in usage
        ? usage.prompt_tokens
        : 0;

  const outputTokens =
    "output_tokens" in usage
      ? usage.output_tokens
      : "completion_tokens" in usage
        ? usage.completion_tokens
        : 0;

  const cacheCreationInputTokens =
    "cache_creation_input_tokens" in usage
      ? usage.cache_creation_input_tokens
      : "prompt_cache_miss_tokens" in usage
        ? usage.prompt_cache_miss_tokens
        : 0;

  const cacheReadInputTokens =
    "cache_read_input_tokens" in usage
      ? usage.cache_read_input_tokens
      : "prompt_cache_hit_tokens" in usage
        ? usage.prompt_cache_hit_tokens
        : 0;

  const cost = 0; // TODO: 添加成本计算逻辑

  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cache_creation_input_tokens: cacheCreationInputTokens,
    cache_read_input_tokens: cacheReadInputTokens,
    cost: cost,
  };
};
