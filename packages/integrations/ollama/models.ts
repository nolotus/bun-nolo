export const ollamaModels = {
  llama3: {
    provider: "ollama",
    name: "Llama 3",
    description: "Large language model",
    performance: {
      contextWindow: 32000,
    },
    input: 0,
    output: 0,
  },
  qwen2: {
    provider: "ollama",
    name: "Qwen 2",
    description: "Advanced language model",
    performance: {
      contextWindow: 128000,
    },
    input: 0,
    output: 0,
  },
  gemma2: {
    provider: "ollama",
    name: "Gemma 2",
    description: "Efficient language model",
    performance: {
      contextWindow: 128000,
    },
    input: 0,
    output: 0,
  },
  codestral: {
    provider: "ollama",
    name: "Codestral",
    description: "Code-specialized language model",
    performance: {
      contextWindow: 128000,
    },
    input: 0,
    output: 0,
  },
  llava: {
    provider: "ollama",
    name: "LLaVA 1.6",
    description: "Large Language and Vision Assistant",
    features: {
      vision: true,
    },
    performance: {
      contextWindow: null,
      maxImageResolution: "1344x1344",
      supportedResolutions: ["672x672", "336x1344", "1344x336"],
    },
    input: 0,
    output: 0,
  },
};
