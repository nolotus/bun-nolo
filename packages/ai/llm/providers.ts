import { anthropicModels } from "integrations/anthropic/models";
import { deepinfraModels } from "integrations/deepinfra/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { fireworksmodels } from "integrations/fireworks/models";
import { googleModels } from "integrations/google/models";
import { mistralModels } from "integrations/mistral/models";
import { openAIModels } from "integrations/openai/models";
import { xaiModels } from "integrations/xai/models";
import { ollamaModels } from "integrations/ollama/models";
import type { Model } from "./types";

export const providerOptions = [
  "openai",
  "anthropic",
  "ollama",
  "fireworks",
  "deepinfra",
  "deepseek",
  "mistral",
  "google",
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
    case "mistral":
      return mistralModels;
    case "google":
      return googleModels;
    default:
      return [];
  }
};
/**
 * 获取指定供应商和模型名称的模型配置
 * @param provider - 供应商名称 (anthropic/openai/deepseek)
 * @param modelName - 模型名称
 */
export const getModel = (provider: Provider, modelName: string) => {
  const models = getModelsByProvider(provider);
  const model = models.find((m) => m.name === modelName);
  if (!model) {
    throw new Error(`Model ${modelName} not found for provider ${provider}`);
  }
  return model;
};
