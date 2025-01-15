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

  // {
  //   name: "o1-preview",
  //   displayName: "O1 Preview",
  //   hasVision: false,
  //   price: { input: 120, output: 480 },
  //   maxOutputTokens: "128k",
  //   contextWindow: "128k",
  //   supportsTool: true,
  // },
  // {
  //   name: "o1-mini",
  //   displayName: "O1 Mini",
  //   hasVision: false,
  //   price: { input: 24, output: 96 },
  //   maxOutputTokens: "128k",
  //   contextWindow: "128k",
  //   supportsTool: true,
  // },
];
