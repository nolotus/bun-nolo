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
    supportsReasoningEffort: true, // 支持推理功能
  },
  {
    name: "deepseek-ai/DeepSeek-V3-0324",
    displayName: "DeepSeek V3 0324",
    hasVision: false,
    price: { input: 0.3 * 8, output: 0.88 * 8 },
    maxOutputTokens: 163880,
    contextWindow: 163880,
  },
];
