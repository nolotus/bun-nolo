export type ModelPrice = {
  [key: string]: { input: number; output: number };
};
import { mistralModels } from "integrations/mistral/models";
import { ollamaModels } from "integrations/ollama/models";
import { googleAIModels } from "integrations/google/ai/models";

export const allModels = {
  ...mistralModels,
  ...ollamaModels,
  ...googleAIModels,
};
