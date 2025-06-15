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
  {
    name: "deepseek-reasoner",
    displayName: "DeepSeek Reasoner",
    hasVision: false,
    contextWindow: 65536, // 64k
    maxOutputTokens: 32768, // 32k tokens
    supportsReasoningEffort: true, // 支持推理功能
    price: {
      input: 4, // 4元 per 1M tokens
      inputCacheHit: 1, // 1元 per 1M tokens (cache hit)
      output: 16, // 16元 per 1M tokens
    },
  },
];
