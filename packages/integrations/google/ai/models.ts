// File: integrations/google/ai/models.js

import { Model } from "ai/llm/types";

export const googleAIModels: Model[] = [
  {
    name: "models/gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    provider: "google",
    description: "Most capable model for a wide range of tasks",
    strengths: "Highest level of intelligence and capability",
    hasVision: true,
    hasAudio: true,
    contextWindow: 128000,
    maxOutputTokens: 2048,
    price: {
      input: 0.075,
      output: 0.3,
    },
    performance: {
      latency: "medium",
    },
    training: {
      dataCutoff: "2023-12",
    },
    limits: {
      free: {
        rpm: 2,
        tpm: 32000,
        rpd: 50,
      },
      payAsYouGo: {
        rpm: 1000,
        tpm: 4000000,
      },
    },
  },
  {
    name: "models/gemini-1.5-flash",
    displayName: "Gemini 1.5 Flash",
    provider: "google",
    description: "High speed model with flexible pricing",
    strengths: "Cost-effective for extended prompts",
    hasVision: true,
    hasAudio: true,
    contextWindow: 128000,
    maxOutputTokens: 2048,
    price: {
      input: 0.075,
      output: 0.3,
    },
    performance: {
      latency: "medium",
    },
    limits: {
      rpm: 2000,
      tpm: 4000000,
    },
  },
];

export const geminiModelNames = Object.keys(googleAIModels);
