// File: integrations/google/ai/models.js

import type { Model } from "ai/llm/types";

export const googleModels: Model[] = [
  {
    name: "gemini-2.0-flash-001",
    displayName: "Gemini 2.0 Flash",
    provider: "google",
    description: "General pay-as-you-go pricing for the Gemini API.",
    strengths: "Flexible pricing based on usage.",
    hasVision: true,
    hasAudio: true,
    contextWindow: 1048576, // 输入 token 限制
    maxOutputTokens: 8192, // 输出 token 限制
    price: {
      input: 0.8, // Cost per 1,000,000 tokens
      output: 3.2, // Cost per 1,000,000 tokens
      cachingWrite: 0.2, // Cost per 1,000,000 tokens
      cachingRead: 0.2, // Cost per 1,000,000 tokens
    },
    performance: {
      latency: "variable",
    },
    canFineTune: false, // Gemini API 是否支持微调，请根据实际情况调整
  },
];
