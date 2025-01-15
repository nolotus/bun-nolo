import { Model } from "ai/llm/types";

export const deepinfraModels: Model[] = [
  {
    name: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    displayName: "LLaMA 3.1 8B",
    hasVision: false,
    contextWindow: 128000,
    price: {
      input: 0.44, // 0.055 * 8
      output: 0.44, // 0.055 * 8
    },
    jsonOutput: true,
    fnCall: true,
  },
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
    name: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    displayName: "LLaMA 3.1 8B Turbo",
    hasVision: false,
    contextWindow: 128000,
    price: {
      input: 0.32, // 0.04 * 8
      output: 0.4, // 0.05 * 8
    },
    jsonOutput: true,
    fnCall: true,
  },
  {
    name: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    displayName: "LLaMA 3.1 70B Turbo",
    hasVision: false,
    contextWindow: 128000,
    price: {
      input: 2.32, // 0.29 * 8
      output: 3.2, // 0.4 * 8
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
];
