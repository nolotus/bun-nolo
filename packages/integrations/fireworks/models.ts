import type { Model } from "ai/llm/types";

export const fireworksmodels: Model[] = [
  {
    name: "accounts/fireworks/models/deepseek-r1",
    displayName: "DeepSeek R1",
    hasVision: false,
    contextWindow: 160000, // 160k
    price: {
      input: 64, // 8 * 8
      output: 64, // 8 * 8
    },
  },
  {
    name: "accounts/fireworks/models/deepseek-r1-basic",
    displayName: "DeepSeek R1 Basic",
    hasVision: false,
    contextWindow: 160000, // 160k
    price: {
      input: 4.4, // $0.55 * 8
      output: 17.52, // $2.19 * 8
    },
  },
  {
    name: "accounts/fireworks/models/deepseek-v3-0324",
    displayName: "DeepSeek V3 0324",
    hasVision: false,
    contextWindow: 160000, // 160k
    fnCall: false, // 设置函数调用为不支持
    price: {
      input: 9.6, // 1.2 * 8
      output: 9.6, // 1.2 * 8
    },
  },
  {
    name: "accounts/fireworks/models/qwen3-235b-a22b",
    displayName: "Qwen 3 235B A22B",
    hasVision: false,
    contextWindow: 125000, // 125k
    price: {
      input: 1.76, // 0.22 * 8
      output: 7.04, // 0.88 * 8
    },
  },
];
