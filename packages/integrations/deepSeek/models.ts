import { Model } from "ai/llm/types";

export const deepSeekModels: Model[] = [
  {
    name: "deepseek-chat",
    displayName: "DeepSeek Chat",
    hasVision: false,
    contextWindow: 131072,
    price: {
      input: 0.00014,
      output: 0.00028,
    },
  },
];
