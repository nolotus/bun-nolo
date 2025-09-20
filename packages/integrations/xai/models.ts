import { Model } from "ai/llm/types";

export const xaiModels: Model[] = [
  {
    name: "grok-4-0709",
    displayName: "Grok4 0709",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 3 * 10, output: 15 * 10 }, // 30分 / 150分 → 0.3$ / 1.5$
    fnCall: true,
    jsonOutput: true,
  },
  {
    name: "grok-4-fast-reasoning",
    displayName: "Grok4 Fast Reasoning",
    hasVision: true, // ✅ 支持图片识别
    contextWindow: 2000000, // ✅ 200万上下文
    price: { input: 0.2 * 10, output: 0.5 * 10 }, // ✅ 乘以10 → 2分 / 5分
    fnCall: true,
    jsonOutput: true,
  },
];
