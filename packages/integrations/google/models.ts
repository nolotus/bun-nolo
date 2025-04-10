// File: integrations/google/ai/models.js

import type { Model } from "ai/llm/types";

export const googleModels: Model[] = [
  {
    name: "gemini-2.0-flash-001",
    displayName: "Gemini 2.0 Flash",
    provider: "google",
    description: "General pay-as-you-go pricing for the Gemini API.",
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
    canFineTune: false, // Gemini API 是否支持微调，请根据实际情况调整
  },
  {
    name: "gemini-2.0-pro-exp-02-05",
    displayName: "Gemini 2.0 Pro (Experimental 02-05)",
    provider: "google",
    description:
      "Experimental version of Gemini 2.0 Pro (release 02-05).  May have different performance and features.",
    hasVision: true, //  Assume it has vision, adjust if not.
    hasAudio: true, //  Assume it has audio, adjust if not.
    // **Important:  Use placeholder values, or best guesses, if you don't know the exact specs.**
    contextWindow: 1048576, // Placeholder - Likely similar to Flash, or possibly larger.
    maxOutputTokens: 8192, // Placeholder - Likely similar to Flash, or possibly larger.
    price: {
      input: 1.0, //  Placeholder -  Likely higher than Flash, as it's "Pro" and experimental.
      output: 4.0, //  Placeholder - Likely higher than Flash.
      cachingWrite: 0.2, // Placeholder - Assume same as Flash unless you have other info.
      cachingRead: 0.2, // Placeholder - Assume same as Flash unless you have other info.
    },
    canFineTune: false, //  Assume no fine-tuning for experimental releases, unless explicitly stated.
  },
  {
    name: "gemini-2.5-pro-exp-03-25",
    displayName: "Gemini 2.5 Pro (Experimental 03-25)",
    provider: "google",
    description:
      "Experimental version of Gemini 2.5 Pro (release 03-25).  May have different performance and features.",
    hasVision: true, //  Assume it has vision, adjust if not.
    hasAudio: true, //  Assume it has audio, adjust if not.
    // **Important:  Use placeholder values, or best guesses, if you don't know the exact specs.**
    contextWindow: 1048576, // Placeholder - Likely similar to Flash, or possibly larger.
    maxOutputTokens: 8192, // Placeholder - Likely similar to Flash, or possibly larger.
    price: {
      input: 0, // 免费
      output: 0, // 免费
      cachingWrite: 0, // 免费
      cachingRead: 0, // 免费
    },
    canFineTune: false, //  Assume no fine-tuning for experimental releases, unless explicitly stated.
  },
  {
    name: "gemini-2.5-pro-preview-03-25",
    displayName: "Gemini 2.5 Pro (Preview 03-25)",
    provider: "google",
    description:
      "Preview version of Gemini 2.5 Pro (release 03-25).  May have different performance and features.",
    hasVision: true, //  Assume it has vision, adjust if not.
    hasAudio: true, //  Assume it has audio, adjust if not.
    // **Important:  Use placeholder values, or best guesses, if you don't know the exact specs.**
    contextWindow: 1048576, // 输入 token 限制
    maxOutputTokens: 65536, // 输出 token 限制
    price: {
      input: 1.25 * 8, // 1.25 * 8 = 10
      output: 10 * 8, // 10 * 8 = 80
      cachingWrite: 0.2, // Placeholder - Assume same as Flash unless you have other info.
      cachingRead: 0.2, // Placeholder - Assume same as Flash unless you have other info.
    },
    canFineTune: false, //  Assume no fine-tuning for experimental releases, unless explicitly stated.
  },
];
