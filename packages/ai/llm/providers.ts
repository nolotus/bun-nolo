// ai/llm/providers.ts
import { deepinfraModels } from "integrations/deepinfra/models";
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
