// ai/llm/providers.ts
import { deepinfraModels } from "integrations/deepinfra/models";
import { xaiModels } from "integrations/xai/models";
import { anthropicModels } from "integrations/anthropic/models";
import { fireworksmodels } from "integrations/fireworks/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { openAIModels } from "integrations/openai/models";
import { Model } from "./types";

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
      return openAIModels;
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
