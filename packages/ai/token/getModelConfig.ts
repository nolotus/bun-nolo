import { anthropicModels } from "integrations/anthropic/anthropicModels";
import { deepSeekModels } from "integrations/deepseek/models";
import { openAIModels } from "integrations/openai/models";
import { deepinfraModels } from "integrations/deepinfra/models";
import { fireworksmodels } from "integrations/fireworks/models";
import { mistralModels } from "integrations/mistral/models";
import { googleModels } from "integrations/google/models";

/**
 * 获取指定provider和模型的配置
 * @throws Error 当provider或model不存在时
 */
export const getModelConfig = (provider: string, modelName: string): Model => {
  const modelMap = {
    anthropic: anthropicModels,
    openai: openAIModels,
    deepseek: deepSeekModels,
    deepinfra: deepinfraModels,
    fireworks: fireworksmodels,
    mistral: mistralModels,
    google: googleModels,
  };

  const models = modelMap[provider];
  if (!models) throw new Error(`Provider ${provider} not supported`);

  const model = models.find((m) => m.name === modelName);
  if (!model) throw new Error(`Model ${modelName} not found`);

  return model;
};
