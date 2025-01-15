import { Model } from "ai/llm/types";

export const deepSeekModels: Model[] = [
  {
    name: "deepseek-chat",
    displayName: "DeepSeek Chat",
    hasVision: false,
    contextWindow: 65536, // 64k
    maxOutputTokens: 8192, // 8k tokens
    price: {
      input: 2, // $0.07 per 1M tokens
      inputCacheHit: 0.5, // $0.014 per 1M tokens (cache hit)
      output: 8, // $1.10 per 1M tokens
    },
  },
];
