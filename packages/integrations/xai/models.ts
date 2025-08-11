import { Model } from "ai/llm/types";

export const xaiModels: Model[] = [
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
