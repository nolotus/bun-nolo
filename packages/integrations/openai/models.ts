import type { Model } from "ai/llm/types";

export const openAIModels: Model[] = [
  {
    name: "gpt-4.1",
    displayName: "GPT-4.1",
    hasVision: true,
    contextWindow: 1047576,
    maxOutputTokens: 32768,
    supportsReasoningEffort: false,
    price: {
      input: 16.0,
      output: 64.0,
      inputCacheHit: 4.0,
    },
  },
  {
    name: "gpt-4.1-mini",
    displayName: "GPT-4.1 Mini",
    hasVision: true,
    contextWindow: 1047576,
    maxOutputTokens: 32768,
    supportsReasoningEffort: false,
    price: {
      input: 3.2,
      output: 12.8,
      inputCacheHit: 0.8,
    },
  },
  {
    name: "gpt-4.1-nano",
    displayName: "GPT-4.1 Nano",
    hasVision: true,
    contextWindow: 1047576,
    maxOutputTokens: 32768,
    supportsReasoningEffort: false,
    price: {
      input: 0.8,
      output: 3.2,
      inputCacheHit: 0.2,
    },
  },
];
