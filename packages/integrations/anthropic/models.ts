export const anthropicModels = [
  {
    name: "claude-3-5-sonnet-latest",
    displayName: "Claude 3.5 Sonnet",
    hasVision: true,
    description: "Most intelligent model",
    strengths: "Highest level of intelligence and capability",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    price: {
      input: 3.0,
      output: 15.0,
    },
  },
  {
    name: "claude-3-haiku-20240307",
    displayName: "Claude 3 Haiku",
    hasVision: true,
    description:
      "Fastest and most compact model for near-instant responsiveness",
    strengths: "Quick and accurate targeted performance",
    contextWindow: 200000,
    maxOutputTokens: 4096,
    price: {
      input: 0.25,
      output: 1.25,
    },
  },
  {
    name: "claude-3-5-haiku-20241022",
    displayName: "Claude 3.5 Haiku",
    hasVision: false,
    description: "",
    strengths: "",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    price: {
      input: 1.0,
      output: 5.0,
    },
  },
];
