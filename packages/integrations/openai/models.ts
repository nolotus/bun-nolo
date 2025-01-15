import type { Model } from "ai/llm/types";

export const openAIModels: Model[] = [
  {
    name: "gpt-4o",
    displayName: "GPT-4O",
    hasVision: false,
    price: { input: 20, output: 80 },
    maxOutputTokens: "8k",
    contextWindow: "128k",
  },
  {
    name: "gpt-4o-mini",
    displayName: "GPT-4O Mini",
    hasVision: false,
    price: { input: 1.2, output: 4.8 },
    maxOutputTokens: "8k",
    contextWindow: "128k",
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
