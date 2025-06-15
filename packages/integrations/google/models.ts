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
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    price: {
      input: 0.8,
      output: 3.2,
      cachingWrite: 0.2,
      cachingRead: 0.2,
    },
  },
  {
    name: "gemini-2.5-pro-preview-05-06",
    displayName: "Gemini 2.5 Pro (Preview 05-06)",
    provider: "google",
    description:
      "Preview version of Gemini 2.5 Pro (release 05-06). May have different performance and features.",
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
    name: "gemini-2.5-flash-preview-05-20",
    displayName: "Gemini 2.5 Flash (Preview 05-20)",
    provider: "google",
    description:
      "Preview version of Gemini 2.5 Flash (release 05-20). May have different performance and features.",
    hasVision: true,
    hasAudio: true,
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    supportsReasoningEffort: true, // 添加支持推理功能
    price: {
      input: 0.15 * 8,
      output: 0.6 * 8,
      cachingWrite: 0.2,
      cachingRead: 0.2,
    },
  },
  {
    name: "gemini-2.0-flash-lite",
    displayName: "Gemini 2.0 Flash Lite",
    provider: "google",
    description: "A lighter version of Gemini 2.0 Flash with lower pricing.",
    hasVision: false,
    hasAudio: true,
    contextWindow: 1048576,
    maxOutputTokens: 4096,
    price: {
      input: 0.075 * 8,
      output: 0.3 * 8,
    },
  },
];
