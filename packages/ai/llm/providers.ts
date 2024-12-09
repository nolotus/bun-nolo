// ai/llm/providers.ts
import { deepinfraModels } from "integrations/deepinfra/models";
import { xaiModels } from "integrations/xai/models";
import { anthropicModels } from "integrations/anthropic/models";
import { Model } from "./types";
import { fireworksmodels } from "integrations/fireworks/models";
import { deepSeekModels } from "integrations/deepseek/models";
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

export const ollamaModels: Model[] = [
  { name: "llama2", hasVision: false, price: { input: 0.002, output: 0.004 } },
  { name: "mistral", hasVision: false, price: { input: 0.003, output: 0.005 } },
];

export const providerOptions = [
  "openai",
  "xai",
  "anthropic",
  "ollama",
  "fireworks",
  "deepinfra",
  "deepseek",
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
      return fireworksmodels;
    case "deepinfra":
      return deepinfraModels;
    case "deepseek":
      return deepSeekModels;
    default:
      return [];
  }
};
