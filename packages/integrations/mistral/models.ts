import { LLMModels } from "ai/llm/types";

export const mistralModels: LLMModels = {
  "mistral-small-latest": {
    provider: "mistral",
    name: "Mistral Small (Latest)",
    api: {
      name: "mistral-small-latest",
    },
    pricing: {
      input: 1,
      output: 3,
      unit: "per 1M tokens",
    },
    model: {
      type: "language",
    },
    performance: {
      contextWindow: 32000,
    },
  },
  "mistral-medium-latest": {
    provider: "mistral",
    name: "Mistral Medium (Latest)",
    api: {
      name: "mistral-medium-latest",
    },
    pricing: {
      input: 2.7,
      output: 8.1,
      unit: "per 1M tokens",
    },
    model: {
      type: "language",
    },
    performance: {
      contextWindow: 32000,
    },
  },
  "mistral-large-latest": {
    provider: "mistral",
    name: "Mistral Large (Latest)",
    api: {
      name: "mistral-large-latest",
    },
    pricing: {
      input: 4,
      output: 12,
      unit: "per 1M tokens",
    },
    model: {
      type: "language",
    },
    performance: {
      contextWindow: 32000,
    },
  },
  "codestral-latest": {
    provider: "mistral",
    name: "Codestral (Latest)",
    api: {
      name: "codestral-latest",
    },
    pricing: {
      input: 1,
      output: 3,
      unit: "per 1M tokens",
    },
    model: {
      type: "code",
    },
  },
  "open-mistral-nemo": {
    provider: "mistral",
    name: "Open Mistral Nemo",
    api: {
      name: "open-mistral-nemo",
    },
    pricing: {
      input: 0.3,
      output: 0.3,
      unit: "per 1M tokens",
    },
    model: {
      type: "language",
    },
  },
  "pixtral-12b-2409": {
    provider: "mistral",
    name: "Pixtral 12B",
    description: "Vision-capable model",
    strengths: "Image understanding and processing",
    api: {
      name: "pixtral-12b-2409",
    },
    features: {
      vision: true,
    },
    pricing: {
      input: 0.15,
      output: 0.15,
      unit: "per 1M tokens",
    },
    model: {
      type: "multimodal",
    },
    performance: {
      contextWindow: 128000,
    },
  },
};
