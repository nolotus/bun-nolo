import { Model } from "ai/llm/types";
export const deepinfraModels: Model[] = [
  {
    name: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    displayName: "LLaMA 3.1 8B",
    hasVision: false,
    contextWindow: 128000,
    price: {
      input: 0.055,
      output: 0.055,
    },
    jsonOutput: true, // 是否支持 JSON 结构化输出
    fnCall: true, // 是否支持函数调用
  },
  {
    name: "meta-llama/Meta-Llama-3.1-405B-Instruct",
    displayName: "LLaMA 3.1 405B",
    hasVision: false,
    contextWindow: 32000,
    price: {
      input: 1.79,
      output: 1.79,
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
      input: 0.04,
      output: 0.05,
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
      input: 0.29,
      output: 0.4,
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
      input: 0.18,
      output: 0.18,
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
      input: 0.35,
      output: 0.4,
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
      input: 0.35,
      output: 0.4,
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
      input: 0.055,
      output: 0.055,
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
      input: 0.23,
      output: 0.4,
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
      input: 0.13,
      output: 0.4,
    },
    jsonOutput: true,
    fnCall: true,
  },
];
