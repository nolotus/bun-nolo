// integrations/openai/models.ts
import type { Model } from "ai/llm/types";

export const openAIModels: Model[] = [
  {
    name: "gpt-5",
    displayName: "GPT-5",
    hasVision: true,
    contextWindow: 400_000,
    maxOutputTokens: 128_000,
    supportsReasoningEffort: true,
    price: { input: 12.5, output: 100, inputCacheHit: 1.25 },
  },
  {
    name: "gpt-5-mini",
    displayName: "GPT-5 mini",
    hasVision: true,
    contextWindow: 400_000,
    maxOutputTokens: 128_000,
    supportsReasoningEffort: true,
    price: { input: 2.5, output: 20, inputCacheHit: 0.25 },
  },
  {
    name: "o3-pro",
    displayName: "O3 Pro",
    hasVision: false,
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    supportsReasoningEffort: true,
    endpointKey: "responses",
    price: { input: 200, output: 800, inputCacheHit: 0 },
  },
];
