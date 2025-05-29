// integrations/deepinfra/models

import { Model } from "ai/llm/types";

export const deepinfraModels: Model[] = [
  {
    name: "deepseek-ai/DeepSeek-R1-0528",
    displayName: "DeepSeek R1 0528",
    hasVision: false,
    price: { input: 0.5, output: 2.18 * 8 },
    maxOutputTokens: 163840,
    contextWindow: 163840,
  },
];
