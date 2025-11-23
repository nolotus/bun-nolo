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
];
