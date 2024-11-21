import { Model } from "ai/llm/providers.ts";
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
  },
];
