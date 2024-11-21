import { Model } from "ai/llm/types";

export const mistralModels: Model[] = [
  {
    name: "Mistral Large",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    price: {
      input: 2,
      output: 6,
    },
    supportsTool: true,
    hasVision: false,
  },
  {
    name: "mistral-nemo",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    price: {
      input: 0.15,
      output: 0.15,
    },
    supportsTool: true,
  },
  {
    name: "Pixtral 12B",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    price: {
      input: 0.15,
      output: 0.15,
    },
    supportsTool: true,
  },
];

export const openaiModels: Model[] = [
  {
    name: "GPT4-O",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    price: {
      input: 2.5,
      output: 10,
    },
  },
  {
    name: "GPT4-O Mini",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    price: {
      input: 0.15,
      output: 0.6,
    },
  },
  {
    name: "O1-Preview",
    maxOutputTokens: "128k",
    contextWindow: "128k",
    price: {
      input: 15.0,
      output: 60.0,
    },
    supportsTool: true,
    hasVision: false,
  },
  {
    name: "O1-Mini",
    maxOutputTokens: "128k",
    contextWindow: "128k",
    price: {
      input: 3.0,
      output: 12.0,
    },
    supportsTool: true,
    hasVision: false,
  },
];

export const googleModels: Model[] = [
  {
    name: "Gimini 1.5 Pro",
    maxOutputTokens: "8k",
    contextWindow: "2m",
    price: {
      input: 1.25,
      output: 5.0,
    },
    hasVision: true,
  },
  {
    name: "Gimini 1.5 Flash",
    maxOutputTokens: "8k",
    contextWindow: "1m",
    price: {
      input: 0.075,
      output: 0.3,
    },
    supportsTool: true,
    hasVision: true,
  },
];

export const deepseekModels: Model[] = [
  {
    name: "DeepSeek 2.5",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    price: {
      input: 0.14,
      output: 0.28,
    },
    supportsTool: true,
  },
];
