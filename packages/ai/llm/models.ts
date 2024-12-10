export type ModelPrice = {
  [key: string]: { input: number; output: number };
};
import { openAIModels } from "integrations/openAI/models";
import { perplexityModelPrice } from "integrations/perplexity/modelPrice";
import { mistralModels } from "integrations/mistral/models";
// import { zhipuModels } from "integrations/zhipu/models";
import { ollamaModels } from "integrations/ollama/models";
import { googleAIModels } from "integrations/google/ai/models";

export const allModels = {
  ...openAIModels,
  ...perplexityModelPrice,
  ...mistralModels,
  ...ollamaModels,

  ...googleAIModels,
};
