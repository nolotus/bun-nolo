// integrations/sambanova/models

import { Model } from "ai/llm/types";

export const sambanovaModels: Model[] = [
  {
    name: "Meta-Llama-3.3-70B-Instruct",
    displayName: "Llama 3.3 70B",
    hasVision: false,
    price: {
      input: 4.8, // 0.60 * 8
      output: 9.6, // 1.20 * 8
    },
  },
];
