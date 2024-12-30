import { Model } from "ai/llm/types";

export const ollamaModels: Model[] = [
  {
    name: "nomic-embed-text:latest",
    displayName: "Nomic Embed Text",
    description: "Text embedding model",
    hasVision: false,
    contextWindow: 8192,
    price: { input: 0, output: 0 }
  },
  {
    name: "mistral-nemo:latest",
    displayName: "Mistral Nemo",
    description: "Mistral-based language model",
    hasVision: false,
    contextWindow: 64000,
    price: { input: 0, output: 0 }
  },
  {
    name: "llama3.1:latest",
    displayName: "Llama 3.1",
    description: "Large language model",
    hasVision: false,
    contextWindow: 128000,
    price: { input: 0, output: 0 }
  },
  {
    name: "llava:latest",
    displayName: "LLaVA",
    description: "Large Language and Vision Assistant",
    hasVision: true,
    contextWindow: null,
    maxImageResolution: "1344x1344",
    supportedResolutions: ["672x672", "336x1344", "1344x336"],
    price: { input: 0, output: 0 }
  },
  {
    name: "gemma2:latest",
    displayName: "Gemma 2",
    description: "Advanced language model",
    hasVision: false,
    contextWindow: 128000,
    price: { input: 0, output: 0 }
  },
  {
    name: "starling-lm:latest",
    displayName: "Starling LM",
    description: "Advanced language model",
    hasVision: false,
    contextWindow: 128000,
    price: { input: 0, output: 0 }
  },
  {
    name: "gemma:latest",
    displayName: "Gemma",
    description: "Efficient language model",
    hasVision: false,
    contextWindow: 128000,
    price: { input: 0, output: 0 }
  },
  {
    name: "mistral:latest",
    displayName: "Mistral",
    description: "Mistral-based language model",
    hasVision: false,
    contextWindow: 64000,
    price: { input: 0, output: 0 }
  }
];
