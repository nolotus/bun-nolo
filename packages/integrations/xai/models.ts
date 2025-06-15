import { Model } from "ai/llm/types";

export const xaiModels: Model[] = [
  {
    name: "grok-3-latest",
    displayName: "Grok3",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 24, output: 120 }, // 真实价格：input: 3 * 8, output: 15 * 8
    fnCall: true, // 支持函数调用
    jsonOutput: true, // 支持结构化输出
  },
  {
    name: "grok-3-fast-latest",
    displayName: "Grok3 Fast Beta",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 40, output: 200 }, // 真实价格：input: 5 * 8, output: 25 * 8
    fnCall: true, // 支持函数调用
    jsonOutput: true, // 支持结构化输出
  },
  {
    name: "grok-3-mini-latest",
    displayName: "Grok3 Mini Beta",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 2.4, output: 4 }, // 真实价格：input: 0.3 * 8, output: 0.5 * 8
    fnCall: true, // 支持函数调用
    jsonOutput: true, // 支持结构化输出
    supportsReasoningEffort: true, // 支持推理功能
  },
  {
    name: "grok-3-mini-fast-latest",
    displayName: "Grok3 Mini Fast Beta",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 4.8, output: 32 }, // 真实价格：input: 0.6 * 8, output: 4 * 8
    fnCall: true, // 支持函数调用
    jsonOutput: true, // 支持结构化输出
    supportsReasoningEffort: true, // 支持推理功能
  },
];
