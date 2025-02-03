import { anthropicModels } from "integrations/anthropic/anthropicModels";
import { deepinfraModels } from "integrations/deepinfra/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { fireworksmodels } from "integrations/fireworks/models";
import { googleModels } from "integrations/google/models";
import { mistralModels } from "integrations/mistral/models";
import { openAIModels } from "integrations/openai/models";
import { ollamaModels } from "integrations/ollama/models";
import { groqModels } from "integrations/groq/models"; // 添加groq的模型导入
import type { Model } from "./types";

export const providerOptions = [
  "anthropic",
  "ollama",
  "fireworks",
  "deepinfra",
  "deepseek",
  "mistral",
  "google",
  "groq", // 添加groq到providerOptions数组中
] as const;

export type Provider = (typeof providerOptions)[number];

export const getModelsByProvider = (provider: Provider): Model[] => {
  switch (provider) {
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
    case "groq": // 添加groq的case语句
      return groqModels;
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
