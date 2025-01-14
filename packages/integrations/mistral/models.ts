export const mistralModels = [
  {
    name: "mistral-small-latest",
    displayName: "Mistral Small (Latest)",
    hasVision: false,
    description: "",
    strengths: "",
    contextWindow: 32000,
    maxOutputTokens: undefined, // 这里没有明确给出
    price: {
      input: 1.6,
      output: 4.8,
    },
  },
  {
    name: "mistral-large-latest",
    displayName: "Mistral Large (Latest)",
    hasVision: false,
    description: "",
    strengths: "",
    contextWindow: "128k",
    maxOutputTokens: "128k",
    price: {
      input: 16,
      output: 48,
    },
  },
  {
    name: "codestral-latest",
    displayName: "Codestral (Latest)",
    hasVision: false,
    description: "",
    strengths: "",
    contextWindow: "256k",
    maxOutputTokens: undefined,
    price: {
      input: 2.4,
      output: 7.2,
    },
  },
  {
    name: "open-mistral-nemo",
    displayName: "Open Mistral Nemo",
    hasVision: false,
    description: "",
    strengths: "",
    contextWindow: "128k", // 这里没有明确给出
    maxOutputTokens: "128k", // 这里没有明确给出
    price: {
      input: 1.2,
      output: 1.2,
    },
  },
  {
    name: "Pixtral Large",
    displayName: "Pixtral 12B",
    hasVision: true,
    description: "Vision-capable model",
    strengths: "Image understanding and processing",
    contextWindow: 128000,
    maxOutputTokens: "128k", // 这里没有明确给出
    price: {
      input: 16,
      output: 48,
    },
  },
];
