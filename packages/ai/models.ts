export type ModelPrice = {
  [key: string]: { input: number; output: number };
};
import { openAIModels } from "integrations/openAI/models";
import { perplexityModelPrice } from "integrations/perplexity/modelPrice";
import { mistralModelPrice } from "integrations/mistral/modelPrice";
import { deepSeekModels } from "integrations/deepSeek/models";

export const modelPrice = {
  ...openAIModels,
  ...perplexityModelPrice,
  ...mistralModelPrice,
  ...deepSeekModels,
};

export const ModelPriceEnum = Object.keys(modelPrice).reduce(
  (acc, key) => {
    acc[key] = key;
    return acc;
  },
  {} as { [key: string]: string },
);
