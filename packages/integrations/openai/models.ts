import { Model } from "ai/llm/types";

export const openAIModels: Model[] = [
  {
    name: "gpt-3.5-turbo",
    displayName: "GPT-3.5 Turbo",
    hasVision: false,
    price: { input: 0.5, output: 1.5 },
  },
  {
    name: "gpt-4-turbo",
    displayName: "GPT-4 Turbo",
    hasVision: false,
    price: { input: 10, output: 30 },
  },
  {
    name: "gpt-4o",
    displayName: "GPT-4O",
    hasVision: false,
    price: { input: 5, output: 15 },
    maxOutputTokens: "8k",
    contextWindow: "128k",
  },
  {
    name: "gpt-4o-mini",
    displayName: "GPT-4O Mini",
    hasVision: false,
    price: { input: 0.15, output: 0.6 },
    maxOutputTokens: "8k",
    contextWindow: "128k",
  },
  {
    name: "o1-preview",
    displayName: "O1 Preview",
    hasVision: false,
    price: { input: 15, output: 60 },
    maxOutputTokens: "128k",
    contextWindow: "128k",
    supportsTool: true,
  },
  {
    name: "o1-mini",
    displayName: "O1 Mini",
    hasVision: false,
    price: { input: 3, output: 12 },
    maxOutputTokens: "128k",
    contextWindow: "128k",
    supportsTool: true,
  },
];
