import type { Model } from "ai/llm/types";

export const openAIModels: Model[] = [
  {
    name: "gpt-4.1",
    displayName: "GPT-4.1",
    hasVision: true,
    contextWindow: 1047576, // 修改为 1,047,576
    maxOutputTokens: 32768, // 修改为 32,768
    price: {
      input: 16.0, // $2.00/MTok * 8
      output: 64.0, // $8.00/MTok * 8
      inputCacheHit: 4.0, // $0.50/MTok * 8
    },
  },
  {
    name: "gpt-4.1-mini",
    displayName: "GPT-4.1 Mini",
    hasVision: true,
    contextWindow: 1047576, // 修改为 1,047,576
    maxOutputTokens: 32768, // 修改为 32,768
    price: {
      input: 3.2, // $0.40/MTok * 8
      output: 12.8, // $1.60/MTok * 8
      inputCacheHit: 0.8, // $0.10/MTok * 8
    },
  },
  {
    name: "gpt-4.1-nano",
    displayName: "GPT-4.1 Nano",
    hasVision: true,
    contextWindow: 1047576, // 修改为 1,047,576
    maxOutputTokens: 32768, // 修改为 32,768
    price: {
      input: 0.8, // $0.10/MTok * 8
      output: 3.2, // $0.40/MTok * 8
      inputCacheHit: 0.2, // $0.025/MTok * 8
    },
  },
];
