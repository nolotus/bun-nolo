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
      input: 1, // Cost per 1,000,000 tokens
      output: 1, // Cost per 1,000,000 tokens
      cachingWrite: 0.2, // Placeholder - Assume same as Flash unless you have other info.
      cachingRead: 0.2, // Placeholder - Assume same as Flash unless you have other info.
    },
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
  },
  {
    name: "gemini-2.5-flash-preview-04-17",
    displayName: "Gemini 2.5 Flash (Preview 04-17)",
    provider: "google",
    description:
      "Preview version of Gemini 2.5 Flash (release 04-17).  May have different performance and features.",
    hasVision: true, //  Assume it has vision, adjust if not.
    hasAudio: true, //  Assume it has audio, adjust if not.
    // **Important:  Use placeholder values, or best guesses, if you don't know the exact specs.**
    contextWindow: 1048576, // Placeholder - Likely similar to Flash, or possibly larger.
    maxOutputTokens: 8192, // Placeholder - Likely similar to Flash, or possibly larger.
    price: {
      input: 0.15, // Cost per 1,000,000 tokens
      output: 0.6, // Cost per 1,000,000 tokens
      cachingWrite: 0.2, // Placeholder - Assume same as Flash unless you have other info.
      cachingRead: 0.2, // Placeholder - Assume same as Flash unless you have other info.
    },
  },
];
