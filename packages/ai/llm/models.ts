export type ModelPrice = {
  [key: string]: { input: number; output: number };
};
import { openAIModels } from "integrations/openAI/models";
import { perplexityModelPrice } from "integrations/perplexity/modelPrice";
import { mistralModels } from "integrations/mistral/models";
import { deepSeekModels } from "integrations/deepSeek/models";
// import { zhipuModels } from "integrations/zhipu/models";
import { ollamaModels } from "integrations/ollama/models";
import { claudeModels } from "integrations/anthropic/models";
import { googleAIModels } from "integrations/google/ai/models";

export const allModels = {
  ...openAIModels,
  ...perplexityModelPrice,
  ...mistralModels,
  ...deepSeekModels,
  ...ollamaModels,
  ...claudeModels,
  ...googleAIModels,
};

//todo add source from
export const modelEnum = Object.keys(allModels).reduce(
  (acc, key) => {
    acc[key] = key;
    return acc;
  },
  {} as { [key: string]: string },
);
