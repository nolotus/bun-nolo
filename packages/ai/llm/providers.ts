import { anthropicModels } from "integrations/anthropic/anthropicModels";
import { deepinfraModels } from "integrations/deepinfra/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { fireworksmodels } from "integrations/fireworks/models";
import { googleModels } from "integrations/google/models";
import { mistralModels } from "integrations/mistral/models";
import { openAIModels } from "integrations/openai/models";
import { ollamaModels } from "integrations/ollama/models";
import { sambanovaModels } from "integrations/sambanova/models";
import { openrouterModels } from "integrations/openrouter/models";
import { xaiModels } from "integrations/xai/models";
interface CybotConfig {
  provider: string;
  customProviderUrl?: string;
}
const CHAT_COMPLETION_URLS = {
  openai: "https://api.openai.com/v1/chat/completions",
  deepinfra: "https://api.deepinfra.com/v1/openai/chat/completions",
  fireworks: "https://api.fireworks.ai/inference/v1/chat/completions",
  xai: "https://api.x.ai/v1/chat/completions",
  deepseek: "https://api.deepseek.com/chat/completions",
  mistral: "https://api.mistral.ai/v1/chat/completions",
  google:
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  ollama: "http://localhost:11434/v1/chat/completions",
  sambanova: "https://api.sambanova.ai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
};

export const getModelConfig = (provider: string, modelName: string): Model => {
  const modelMap = {
    anthropic: anthropicModels,
    openai: openAIModels,
    deepseek: deepSeekModels,
    deepinfra: deepinfraModels,
    fireworks: fireworksmodels,
    mistral: mistralModels,
    google: googleModels,
    xai: xaiModels,
    openrouter: openrouterModels,
  };

  const models = modelMap[provider];
  if (!models) throw new Error(`Provider ${provider} not supported`);

  const model = models.find((m) => m.name === modelName);
  if (!model) throw new Error(`Model ${modelName} not found`);

  return model;
};

export function getApiEndpoint(cybotConfig: CybotConfig): string {
  if (cybotConfig.customProviderUrl) {
    return cybotConfig.customProviderUrl;
  }
  const provider = cybotConfig.provider.toLowerCase();
  if (provider === "custom") {
    if (!cybotConfig.customProviderUrl) {
      throw new Error(
        "Custom provider URL is required when provider is 'custom'."
      );
    }
    return cybotConfig.customProviderUrl;
  }
  const endpoint = CHAT_COMPLETION_URLS[provider];
  if (!endpoint) {
    throw new Error(`Unsupported provider: ${cybotConfig.provider}`);
  }
  return endpoint;
}

import type { Model } from "./types";

const providerOptions = [
  "openrouter",
  "anthropic",
  "ollama",
  "fireworks",
  "deepinfra",
  "deepseek",
  "mistral",
  "google",
  "sambanova",
  "openai",
  "xai",
] as const;

export type Provider = (typeof providerOptions)[number];

// 增加availableProviderOptions
export const availableProviderOptions = providerOptions;

export const getModelsByProvider = (provider: Provider): Model[] => {
  const modelsMap: Record<Provider, Model[]> = {
    anthropic: anthropicModels,
    ollama: ollamaModels,
    fireworks: fireworksmodels,
    deepinfra: deepinfraModels,
    deepseek: deepSeekModels,
    mistral: mistralModels,
    google: googleModels,
    sambanova: sambanovaModels,
    openai: openAIModels,
    openrouter: openrouterModels,
    xai: xaiModels,
  };
  return modelsMap[provider] || [];
};
