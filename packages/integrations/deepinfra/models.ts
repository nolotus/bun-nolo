import { Model } from "ai/llm/types";

export const deepinfraModels: Model[] = [
  {
    name: "meta-llama/Meta-Llama-3.1-405B-Instruct",
    displayName: "LLaMA 3.1 405B",
    hasVision: false,
    contextWindow: 32000,
    price: {
      input: 14.32, // 1.79 * 8
      output: 14.32, // 1.79 * 8
    },
    jsonOutput: true,
    fnCall: true,
  },

  {
    name: "Qwen/Qwen2.5-Coder-32B-Instruct",
    displayName: "Qwen 2.5 32B",
    hasVision: false,
    contextWindow: 32000,
    price: {
      input: 1.44, // 0.18 * 8
      output: 1.44, // 0.18 * 8
    },
    jsonOutput: true,
    fnCall: true,
  },
  {
    name: "Qwen/Qwen2.5-72B-Instruct",
    displayName: "Qwen 2.5 72B",
    hasVision: false,
    contextWindow: 32000,
    price: {
      input: 2.8, // 0.35 * 8
      output: 3.2, // 0.4 * 8
    },
    jsonOutput: true,
    fnCall: true,
  },
  {
    name: "meta-llama/Llama-3.2-90B-Vision-Instruct",
    displayName: "LLaMA 3.2 90B Vision",
    hasVision: true,
    contextWindow: 32000,
    price: {
      input: 2.8, // 0.35 * 8
      output: 3.2, // 0.4 * 8
    },
    jsonOutput: true,
    fnCall: true,
  },
  {
    name: "meta-llama/Llama-3.2-11B-Vision-Instruct",
    displayName: "LLaMA 3.2 11B Vision",
    hasVision: true,
    contextWindow: 128000,
    price: {
      input: 0.44, // 0.055 * 8
      output: 0.44, // 0.055 * 8
    },
    jsonOutput: true,
    fnCall: true,
  },
  {
    name: "meta-llama/Llama-3.3-70B-Instruct",
    displayName: "LLaMA 3.3 70B",
    hasVision: false,
    contextWindow: 131072,
    price: {
      input: 1.84, // 0.23 * 8
      output: 3.2, // 0.4 * 8
    },
    jsonOutput: true,
    fnCall: true,
  },
  {
    name: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    displayName: "LLaMA 3.3 70B Turbo",
    hasVision: false,
    contextWindow: 131072,
    price: {
      input: 1.04, // 0.13 * 8
      output: 3.2, // 0.4 * 8
    },
    jsonOutput: true,
    fnCall: true,
  },
  {
    name: "deepseek-ai/DeepSeek-R1",
    displayName: "DeepSeek R1",
    hasVision: false,
    contextWindow: 16000,
    price: {
      input: 6.8, // 0.85 * 8 (保持与原有注释计算方式一致)
      output: 20.0, // 2.50 * 8 (保持与原有注释计算方式一致)
    },
    jsonOutput: true,
    fnCall: true,
  },
  {
    name: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
    displayName: "DeepSeek-R1-Distill-Llama-70B",
    hasVision: false,
    contextWindow: 131072,
    price: {
      input: 1.84, // 0.23 * 8
      output: 5.52, // 0.69 * 8
    },
    jsonOutput: true,
    fnCall: true,
  },
];
