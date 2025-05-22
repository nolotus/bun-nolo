import { Model } from "ai/llm/types";

export const ollamaModels: Model[] = [
  {
    name: "mistral-small:latest",
    displayName: "Mistral Small",
    description: "Mistral-small language model",
    hasVision: false,
    contextWindow: 32000,
    price: { input: 0, output: 0 },
  },
  {
    name: "mistral-small3.1:latest",
    displayName: "Mistral Small3.1",
    description: "Mistral-small language model",
    hasVision: false,
    contextWindow: 128000,
    price: { input: 0, output: 0 },
  },
  {
    name: "llama3.1:latest",
    displayName: "Llama 3.1",
    description: "Large language model",
    hasVision: false,
    contextWindow: 128000,
    price: { input: 0, output: 0 },
  },
  {
    name: "llava:latest",
    displayName: "LLaVA",
    description: "Large Language and Vision Assistant",
    hasVision: true,
    contextWindow: null,
    maxImageResolution: "1344x1344",
    supportedResolutions: ["672x672", "336x1344", "1344x336"],
    price: { input: 0, output: 0 },
  },
];
