import { Model } from "ai/llm/types";

export const xaiModels: Model[] = [
  {
    name: "grok-3-latest",
    displayName: "Grok3",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 30, output: 150 },
    fnCall: true,
    jsonOutput: true,
  },
  {
    name: "grok-3-fast-latest",
    displayName: "Grok3 Fast Beta",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 50, output: 250 },
    fnCall: true,
    jsonOutput: true,
  },
  {
    name: "grok-3-mini-latest",
    displayName: "Grok3 Mini Beta",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 3, output: 5 },
    fnCall: true,
    jsonOutput: true,
    supportsReasoningEffort: true,
  },
  {
    name: "grok-3-mini-fast-latest",
    displayName: "Grok3 Mini Fast Beta",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 6, output: 40 },
    fnCall: true,
    jsonOutput: true,
    supportsReasoningEffort: true,
  },
  {
    name: "grok-4-0709",
    displayName: "Grok4 0709",
    hasVision: false, // 假设与其他模型相同
    contextWindow: 131072, // 假设与其他模型相同
    price: { input: 3 * 10, output: 15 * 10 },
    fnCall: true, // 假设与其他模型相同
    jsonOutput: true, // 假设与其他模型相同
  },
];
