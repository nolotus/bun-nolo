// integrations/sambanova/models

import { Model } from "ai/llm/types";

export const sambanovaModels: Model[] = [
  {
    name: "Llama 3.3 70B",
    displayName: "Llama 3.3 70B",
    hasVision: false,
    price: {
      input: 4.8, // 0.60 * 8
      output: 9.6, // 1.20 * 8
    },
  },
  {
    name: "Qwen/QwQ-32B-Preview",
    displayName: "Qwen/QwQ-32B-Preview",
    hasVision: false,
    price: {
      input: 12.0, // 1.50 * 8
      output: 24.0, // 3.00 * 8
    },
  },
  {
    name: "Llama 3.1 8B",
    displayName: "Llama 3.1 8B",
    hasVision: false,
    price: {
      input: 0.8, // 0.10 * 8
      output: 1.6, // 0.20 * 8
    },
  },
  {
    name: "Llama 3.1 70B",
    displayName: "Llama 3.1 70B",
    hasVision: false,
    price: {
      input: 4.8, // 0.60 * 8
      output: 9.6, // 1.20 * 8
    },
  },
  {
    name: "Qwen/Qwen2.5-Coder-32B-Instruct",
    displayName: "Qwen 2.5 Coder 32B",
    hasVision: false,
    price: {
      input: 12.0, // 1.50 * 8
      output: 24.0, // 3.00 * 8
    },
  },
  {
    name: "Qwen/Qwen2.5-72B-Instruct",
    displayName: "Qwen 2.5 72B",
    hasVision: false,
    price: {
      input: 16.0, // 2.00 * 8
      output: 32.0, // 4.00 * 8
    },
  },
  {
    name: "Llama 3.2 11B Vision",
    displayName: "Llama 3.2 11B Vision",
    hasVision: true,
    price: {
      input: 1.2, // 0.15 * 8
      output: 2.4, // 0.30 * 8
    },
  },
  {
    name: "Llama 3.2 90B Vision",
    displayName: "Llama 3.2 90B Vision",
    hasVision: true,
    price: {
      input: 6.4, // 0.80 * 8
      output: 12.8, // 1.60 * 8
    },
  },
  {
    name: "Llama-Guard-3-8B",
    displayName: "Llama-Guard-3-8B",
    hasVision: false,
    price: {
      input: 2.4, // 0.30 * 8
      output: 2.4, // 0.30 * 8
    },
  },
  {
    name: "Llama 3.1 405B",
    displayName: "Llama 3.1 405B",
    hasVision: false,
    price: {
      input: 40.0, // 5.00 * 8
      output: 80.0, // 10.00 * 8
    },
  },
  {
    name: "Llama 3.2 1B",
    displayName: "Llama 3.2 1B",
    hasVision: false,
    price: {
      input: 0.32, // 0.04 * 8
      output: 0.64, // 0.08 * 8
    },
  },
  {
    name: "Llama 3.2 3B",
    displayName: "Llama 3.2 3B",
    hasVision: false,
    price: {
      input: 0.64, // 0.08 * 8
      output: 1.28, // 0.16 * 8
    },
  },
  {
    name: "allenai/Llama-3.1-Tulu-3-405B",
    displayName: "allenai/Llama-3.1-Tulu-3-405B",
    hasVision: false,
    price: {
      input: 40.0, // 5.00 * 8
      output: 80.0, // 10.00 * 8
    },
  },
  {
    name: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
    displayName: "DeepSeek-R1-Distill-Llama-70B",
    hasVision: false,
    price: {
      input: 5.6, // 0.70 * 8
      output: 11.2, // 1.40 * 8
    },
  },
];
