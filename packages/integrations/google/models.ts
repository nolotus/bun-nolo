// File: integrations/google/ai/models.js

import type { Model } from "ai/llm/types";

export const googleModels: Model[] = [
  {
    name: "gemini-2.5-pro",
    displayName: "Gemini 2.5 Pro",
    provider: "google",
    description: "The full version of Gemini 2.5 Pro with all features.",
    hasVision: true,
    hasAudio: true,
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    supportsReasoningEffort: true,
    price: {
      input: 1.25 * 9,
      output: 10 * 9,
      cachingWrite: 0.2 * 9,
      cachingRead: 0.2 * 9,
    },
  },
  {
    name: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
    provider: "google",
    description: "The full version of Gemini 2.5 Flash with all features.",
    hasVision: true,
    hasAudio: true,
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    supportsReasoningEffort: true,
    price: {
      input: 0.3 * 9,
      output: 2.5 * 9,
      cachingWrite: 0.2 * 9,
      cachingRead: 0.2 * 9,
    },
  },
  {
    name: "gemini-2.5-flash-lite",
    displayName: "Gemini 2.5 Flash Lite",
    provider: "google",
    description:
      "Our smallest and most cost-effective model, built for at scale usage.",
    hasVision: false,
    hasAudio: true,
    contextWindow: 1048576,
    maxOutputTokens: 4096,
    price: {
      input: 0.1 * 9, // $0.10 per 1M tokens
      output: 0.4 * 9, // $0.40 per 1M tokens
      cachingWrite: 0.2 * 9,
      cachingRead: 0.2 * 9,
    },
  },
  {
    name: "gemini-3-pro-preview",
    displayName: "Gemini 3 Pro (Preview)",
    provider: "google",
    description:
      "Google's most advanced model with enhanced reasoning (inc. thinking tokens), vision, and audio. Tiered pricing: Input ≤200k: $2.00/M tokens, >200k: $4.00/M tokens. Output ≤200k: $12.00/M tokens, >200k: $18.00/M tokens. Cache ≤200k: $0.20/M tokens, >200k: $0.40/M tokens. Storage: $4.50/M tokens/hour.",
    hasVision: true,
    hasAudio: true,
    contextWindow: 2097152, // 2M tokens (assumed, pending official specs)
    maxOutputTokens: 65536, // Assumed based on 2.5 Pro capability
    supportsReasoningEffort: true,
    // Base tier (Tier 1: ≤ 200k tokens)
    price: {
      input: 2.0 * 9, // $2.00 per 1M
      output: 12.0 * 9, // $12.00 per 1M
      cachingWrite: 0.2 * 9, // $0.20 per 1M
      cachingRead: 0.2 * 9, // $0.20 per 1M
    },
    // Tier 2: > 200k tokens
    pricingStrategy: {
      type: "tiered_context",
      tiers: [
        {
          minContext: 200001, // Threshold > 200k
          price: {
            input: 4.0 * 9, // $4.00 per 1M (2x)
            output: 18.0 * 9, // $18.00 per 1M (1.5x)
            cachingWrite: 0.4 * 9, // $0.40 per 1M (2x)
            cachingRead: 0.4 * 9, // $0.40 per 1M (2x)
          },
        },
      ],
    },
  },
];
