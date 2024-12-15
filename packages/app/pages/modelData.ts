import { Model } from "ai/llm/types";

export const googleModels: Model[] = [
  {
    name: "Gimini 1.5 Pro",
    maxOutputTokens: "8k",
    contextWindow: "2m",
    price: {
      input: 1.25,
      output: 5.0,
    },
    hasVision: true,
  },
  {
    name: "Gimini 1.5 Flash",
    maxOutputTokens: "8k",
    contextWindow: "1m",
    price: {
      input: 0.075,
      output: 0.3,
    },
    supportsTool: true,
    hasVision: true,
  },
];

export const deepseekModels: Model[] = [
  {
    name: "DeepSeek 2.5",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    price: {
      input: 0.14,
      output: 0.28,
    },
    supportsTool: true,
  },
];
