import type { Model } from "ai/llm/types";

export const fireworksmodels: Model[] = [
  {
    name: "accounts/fireworks/models/llama-v3p1-405b-instruct",
    displayName: "LLaMA V3.1 405B",
    hasVision: false,
    contextWindow: 131072,
    price: {
      input: 24, // 3 * 8
      output: 24, // 3 * 8
    },
  },
  {
    name: "accounts/fireworks/models/qwen2p5-coder-32b-instruct",
    displayName: "Qwen 2.5 Coder 32B",
    hasVision: false,
    contextWindow: 32768,
    price: {
      input: 7.2, // 0.9 * 8
      output: 7.2, // 0.9 * 8
    },
  },
  {
    name: "accounts/fireworks/models/qwen2p5-72b-instruct",
    displayName: "Qwen 2.5 72B",
    hasVision: false,
    contextWindow: 32768,
    price: {
      input: 7.2, // 0.9 * 8
      output: 7.2, // 0.9 * 8
    },
  },
  {
    name: "accounts/fireworks/models/llama-v3p3-70b-instruct",
    displayName: "LLaMA V3.3 70B",
    hasVision: false,
    contextWindow: 131072,
    price: {
      input: 7.2, // 0.9 * 8
      output: 7.2, // 0.9 * 8
    },
  },
  {
    name: "accounts/fireworks/models/llama-v3p1-8b-instruct",
    displayName: "LLaMA V3.1 8B",
    hasVision: false,
    contextWindow: 131072,
    price: {
      input: 1.6, // 0.2 * 8
      output: 1.6, // 0.2 * 8
    },
  },
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
];
