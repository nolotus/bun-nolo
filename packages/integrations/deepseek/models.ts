import { Model } from "ai/llm/types";

export const deepSeekModels: Model[] = [
  {
    name: "deepseek-chat",
    displayName: "DeepSeek Chat",
    hasVision: false,
    contextWindow: 65536, // 64k in bytes
    price: {
      input: 0.14,
      output: 0.28,
    },
  },
];
