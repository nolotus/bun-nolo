// File: integrations/google/ai/models.js

import type { Model } from "ai/llm/types";

export const googleModels: Model[] = [
  {
    name: "gemini-2.5-pro-preview-06-05",
    displayName: "Gemini 2.5 Pro (Preview 06-05)",
    provider: "google",
    description:
      "Preview version of Gemini 2.5 Pro (release 06-05). May have different performance and features.",
    hasVision: true,
    hasAudio: true,
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    supportsReasoningEffort: true, // 添加支持推理功能
    price: {
      input: 1.25 * 8,
      output: 10 * 8,
      cachingWrite: 0.2,
      cachingRead: 0.2,
    },
  },
  {
    name: "gemini-2.5-pro",
    displayName: "Gemini 2.5 Pro",
    provider: "google",
    description: "The full version of Gemini 2.5 Pro with all features.",
    hasVision: true,
    hasAudio: true,
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    supportsReasoningEffort: true, // 添加支持推理功能
    price: {
      input: 1.25 * 8,
      output: 10 * 8,
      cachingWrite: 0.2,
      cachingRead: 0.2,
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
    supportsReasoningEffort: true, // 添加支持推理功能
    price: {
      input: 0.3 * 8,
      output: 2.5 * 8,
      cachingWrite: 0.2,
      cachingRead: 0.2,
    },
  },
  {
    name: "gemini-2.5-flash-lite-preview-06-17",
    displayName: "Gemini 2.5 Flash Lite (Preview 06-17)",
    provider: "google",
    description:
      "Our smallest and most cost-effective model, built for at scale usage. Try it in Google AI Studio.",
    hasVision: false,
    hasAudio: true,
    contextWindow: 1048576,
    maxOutputTokens: 4096,
    price: {
      input: 0.1 * 8, // $0.10 per 1M tokens, multiplied by 8
      output: 0.4 * 8, // $0.40 per 1M tokens, multiplied by 8
      cachingWrite: 0.2,
      cachingRead: 0.2,
    },
  },
];
