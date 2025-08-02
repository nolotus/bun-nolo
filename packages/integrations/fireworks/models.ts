import type { Model } from "ai/llm/types";

export const fireworksmodels: Model[] = [
  {
    name: "accounts/fireworks/models/deepseek-r1-0528",
    displayName: "DeepSeek R1 0528",
    hasVision: false,
    contextWindow: 160000, // 160k
    price: {
      input: 30, // 3 * 10
      output: 80, // 8 * 10
    },
    supportsReasoningEffort: true,
  },
  {
    name: "accounts/fireworks/models/deepseek-r1-basic",
    displayName: "DeepSeek R1 Basic",
    hasVision: false,
    contextWindow: 160000, // 160k
    price: {
      input: 5.5, // $0.55 * 10
      output: 21.9, // $2.19 * 10
    },
    supportsReasoningEffort: true,
  },
  {
    name: "accounts/fireworks/models/deepseek-v3-0324",
    displayName: "DeepSeek V3 0324",
    hasVision: false,
    contextWindow: 160000, // 160k
    fnCall: false,
    price: {
      input: 9, // 0.9 * 10
      output: 9, // 0.9 * 10
    },
  },
  // 新增的模型
  {
    name: "accounts/fireworks/models/glm-4p5",
    displayName: "GLM 4P5",
    hasVision: false,
    contextWindow: 128000, // 128k (假设值，可根据实际调整)
    price: {
      input: 5.5, // $0.55 * 10
      output: 21.9, // $2.19 * 10
    },
  },
  // 新增的模型
  {
    name: "accounts/fireworks/models/qwen3-coder-480b-a35b-instruct",
    displayName: "Qwen 3 Coder 480B A35B Instruct",
    hasVision: false,
    contextWindow: 256000, // 256k
    price: {
      input: 4.5, // $0.45 * 10
      output: 18, // $1.8 * 10
    },
  },
  // 新增的模型
  {
    name: "accounts/fireworks/models/qwen3-235b-a22b-instruct-2507",
    displayName: "Qwen 3 235B A22B Instruct 2507",
    hasVision: false,
    contextWindow: 125000, // 125k (假设值，可根据实际调整)
    price: {
      input: 2.2, // $0.22 * 10
      output: 8.8, // $0.88 * 10
    },
  },
  // 新增的模型
  {
    name: "accounts/fireworks/models/qwen3-235b-a22b-thinking-2507",
    displayName: "Qwen 3 235B A22B Thinking 2507",
    hasVision: false,
    contextWindow: 125000, // 125k
    price: {
      input: 2.2, // $0.22 * 10
      output: 8.8, // $0.88 * 10
    },
  },
];
