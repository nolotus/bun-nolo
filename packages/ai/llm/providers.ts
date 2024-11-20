// ai/llm/providers.ts

export interface Model {
  name: string;
  hasVision: boolean;
  contextWindow?: number; // For context window information
  price?: {
    input: number; // Price per 1 million tokens for input
    output: number; // Price per 1 million tokens for output
  };
}

export const openaiModels: Model[] = [
  {
    name: "gpt-3.5-turbo",
    hasVision: false,
    price: { input: 0.0015, output: 0.002 },
  },
  { name: "gpt-4", hasVision: false, price: { input: 0.03, output: 0.06 } },
  {
    name: "gpt-4-vision-preview",
    hasVision: true,
    price: { input: 0.03, output: 0.06 },
  },
];

export const xaiModels: Model[] = [
  {
    name: "grok-beta",
    hasVision: false,
    price: { input: 0.0005, output: 0.001 },
  },
  {
    name: "grok-vision-beta",
    hasVision: true,
    price: { input: 0.0005, output: 0.001 },
  },
];

export const anthropicModels: Model[] = [
  { name: "claude-1", hasVision: false, price: { input: 0.01, output: 0.01 } },
  { name: "claude-2", hasVision: false, price: { input: 0.01, output: 0.01 } },
  { name: "claude-3", hasVision: true, price: { input: 0.01, output: 0.01 } },
];

export const ollamaModels: Model[] = [
  { name: "llama2", hasVision: false, price: { input: 0.002, output: 0.004 } },
  { name: "mistral", hasVision: false, price: { input: 0.003, output: 0.005 } },
];

export const fireworksModels: Model[] = [
  {
    name: "fireworks-turbo",
    hasVision: false,
    price: { input: 0.001, output: 0.002 },
  },
  {
    name: "fireworks-vision",
    hasVision: true,
    price: { input: 0.001, output: 0.002 },
  },
];

export const deepinfraModels: Model[] = [
  {
    name: "deepinfra-1",
    hasVision: false,
    price: { input: 0.0005, output: 0.001 },
  },
  {
    name: "deepinfra-vision",
    hasVision: true,
    price: { input: 0.0005, output: 0.001 },
  },
  {
    name: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    hasVision: false,
    contextWindow: 128000,
    price: {
      input: 0.055,
      output: 0.055,
    },
  },
  {
    name: "meta-llama/Meta-Llama-3.1-405B-Instruct",
    hasVision: false,
    contextWindow: 32000,
    price: {
      input: 1.79,
      output: 1.79,
    },
  },
  {
    name: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    hasVision: false,
    contextWindow: 128000,
    price: {
      input: 0.04,
      output: 0.05,
    },
  },
  {
    name: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    hasVision: false,
    contextWindow: 128000,
    price: {
      input: 0.29,
      output: 0.4,
    },
  },
  {
    name: "Qwen/Qwen2.5-Coder-32B-Instruct",
    hasVision: false,
    contextWindow: 32000,
    price: {
      input: 0.18,
      output: 0.18,
    },
  },
  {
    name: "Qwen/Qwen2.5-72B-Instruct",
    hasVision: false,
    contextWindow: 32000,
    price: {
      input: 0.35,
      output: 0.4,
    },
  },
  {
    name: "meta-llama/Llama-3.2-90B-Vision-Instruct",
    hasVision: true,
    contextWindow: 32000,
    price: {
      input: 0.35,
      output: 0.4,
    },
  },
  {
    name: "meta-llama/Llama-3.2-11B-Vision-Instruct",
    hasVision: true,
    contextWindow: 128000,
    price: {
      input: 0.055,
      output: 0.055,
    },
  },
];

export const providerOptions = [
  "openai",
  "xai",
  "anthropic",
  "ollama",
  "fireworks",
  "deepinfra",
] as const;

export type Provider = (typeof providerOptions)[number];

export const getModelsByProvider = (provider: Provider): Model[] => {
  switch (provider) {
    case "openai":
      return openaiModels;
    case "xai":
      return xaiModels;
    case "anthropic":
      return anthropicModels;
    case "ollama":
      return ollamaModels;
    case "fireworks":
      return fireworksModels;
    case "deepinfra":
      return deepinfraModels;
    default:
      return [];
  }
};
