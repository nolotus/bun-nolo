import type { Model } from "ai/llm/types";

export const openAIModels: Model[] = [
  {
    name: "gpt-4o",
    displayName: "GPT-4O",
    hasVision: false,
    contextWindow: 128000,
    maxOutputTokens: 8192,
    price: {
      input: 20.0, // $2.50/MTok * 8
      output: 80.0, // $10.00/MTok * 8
      inputCacheHit: 10.0, // $1.25/MTok * 8
    },
  },
  {
    name: "gpt-4o-mini",
    displayName: "GPT-4O Mini",
    hasVision: false,
    contextWindow: 128000,
    maxOutputTokens: 8192,
    price: {
      input: 1.2, // $0.150/MTok * 8
      output: 4.8, // $0.600/MTok * 8
      inputCacheHit: 0.6, // $0.075/MTok * 8
    },
  },
  {
    name: "gpt-4.1",
    displayName: "GPT-4.1",
    hasVision: false,
    contextWindow: 128000,
    maxOutputTokens: 8192,
    price: {
      input: 16.0, // $2.00/MTok * 8
      output: 64.0, // $8.00/MTok * 8
      inputCacheHit: 4.0, // $0.50/MTok * 8
    },
  },
  {
    name: "gpt-4.1-mini",
    displayName: "GPT-4.1 Mini",
    hasVision: false,
    contextWindow: 128000,
    maxOutputTokens: 8192,
    price: {
      input: 3.2, // $0.40/MTok * 8
      output: 12.8, // $1.60/MTok * 8
      inputCacheHit: 0.8, // $0.10/MTok * 8
    },
  },
  {
    name: "gpt-4.1-nano",
    displayName: "GPT-4.1 Nano",
    hasVision: false,
    contextWindow: 128000,
    maxOutputTokens: 8192,
    price: {
      input: 0.8, // $0.10/MTok * 8
      output: 3.2, // $0.40/MTok * 8
      inputCacheHit: 0.2, // $0.025/MTok * 8
    },
  },
];
