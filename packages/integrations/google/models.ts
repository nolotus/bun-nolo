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
    name: "gemini-2.5-pro-preview-05-06",
    displayName: "Gemini 2.5 Pro (Preview 05-06)",
    provider: "google",
    description:
      "Preview version of Gemini 2.5 Pro (release 05-06).  May have different performance and features.",
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
    name: "gemini-2.5-pro-preview-06-05", // 新添加的模型
    displayName: "Gemini 2.5 Pro (Preview 06-05)", // 更新显示名称
    provider: "google",
    description:
      "Preview version of Gemini 2.5 Pro (release 06-05).  May have different performance and features.", // 更新描述
    hasVision: true,
    hasAudio: true,
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
    name: "gemini-2.5-flash-preview-05-20",
    displayName: "Gemini 2.5 Flash (Preview 05-20)",
    provider: "google",
    description:
      "Preview version of Gemini 2.5 Flash (release 05-20).  May have different performance and features.",
    hasVision: true, //  Assume it has vision, adjust if not.
    hasAudio: true, //  Assume it has audio, adjust if not.
    // **Important:  Use placeholder values, or best guesses, if you don't know the exact specs.**
    contextWindow: 1048576, // Placeholder - Likely similar to Flash, or possibly larger.
    maxOutputTokens: 8192, // Placeholder - Likely similar to Flash, or possibly larger.
    price: {
      input: 0.15 * 8, // Cost per 1,000,000 tokens, 0.15 * 8 = 1.2
      output: 0.6 * 8, // Cost per 1,000,000 tokens, 0.6 * 8 = 4.8
      cachingWrite: 0.2, // Placeholder - Assume same as Flash unless you have other info.
      cachingRead: 0.2, // Placeholder - Assume same as Flash unless you have other info.
    },
  },
  {
    name: "gemini-2.0-flash-lite",
    displayName: "Gemini 2.0 Flash Lite",
    provider: "google",
    description: "A lighter version of Gemini 2.0 Flash with lower pricing.",
    hasVision: false, //  已修改为 false
    hasAudio: true, //  Assume it has audio, adjust if not.
    // **Important:  Use placeholder values, or best guesses, if you don't know the exact specs.**
    contextWindow: 1048576, // Placeholder - Likely similar to Flash, or possibly smaller.
    maxOutputTokens: 4096, // Placeholder - Likely smaller than Flash.
    price: {
      input: 0.075 * 8, // Cost per 1,000,000 tokens, 0.075 * 8 = 0.6
      output: 0.3 * 8, // Cost per 1,000,000 tokens, 0.3 * 8 = 2.4
    },
  },
];
