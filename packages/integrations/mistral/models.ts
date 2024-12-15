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
      input: 0.2,
      output: 0.6,
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
      input: 4,
      output: 12,
    },
  },
  {
    name: "codestral-latest",
    displayName: "Codestral (Latest)",
    hasVision: false,
    description: "",
    strengths: "",
    contextWindow: "32k", // 这里没有明确给出
    maxOutputTokens: undefined, // 这里没有明确给出
    price: {
      input: 0.2,
      output: 0.6,
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
      input: 0.15,
      output: 0.15,
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
      input: 2,
      output: 6,
    },
  },
];
