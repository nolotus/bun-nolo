import { Model } from "ai/llm/types";

export const deepSeekModels: Model[] = [
  {
    name: "deepseek-chat",
    displayName: "DeepSeek Chat",
    hasVision: false,
    contextWindow: 65536, // 64k
    maxOutputTokens: 8192, // 8k tokens
    price: {
      input: 0.07, // $0.07 per 1M tokens
      inputCacheHit: 0.014, // $0.014 per 1M tokens (cache hit)
      output: 1.1, // $1.10 per 1M tokens
    },
  },
];

export function calculatePrice(usage: {
  completion_tokens: number;
  prompt_cache_hit_tokens: number;
  prompt_cache_miss_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
}) {
  const perMillionTokens = {
    input: 0.07,
    inputCacheHit: 0.014,
    output: 1.1,
  };

  const cacheMissPrice =
    (usage.prompt_cache_miss_tokens / 1_000_000) * perMillionTokens.input;
  const cacheHitPrice =
    (usage.prompt_cache_hit_tokens / 1_000_000) *
    perMillionTokens.inputCacheHit;
  const outputPrice =
    (usage.completion_tokens / 1_000_000) * perMillionTokens.output;

  const totalPrice = cacheMissPrice + cacheHitPrice + outputPrice;

  return totalPrice;
}
