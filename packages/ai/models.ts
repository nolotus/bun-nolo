export type ModelPrice = {
  [key: string]: { input: number; output: number };
};
import { openAIModels } from "integrations/openAI/models";
import { perplexityModelPrice } from "integrations/perplexity/modelPrice";
import { mistralModels } from "integrations/mistral/models";
import { deepSeekModels } from "integrations/deepSeek/models";

export const modelPrice = {
  ...openAIModels,
  ...perplexityModelPrice,
  ...mistralModels,
  ...deepSeekModels,
};

export const ModelPriceEnum = Object.keys(modelPrice).reduce(
  (acc, key) => {
    acc[key] = key;
    return acc;
  },
  {} as { [key: string]: string },
);
