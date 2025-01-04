// anthropicModels.ts
export const anthropicModels = [
  {
    name: "claude-3-5-sonnet-latest",
    displayName: "Claude 3.5 Sonnet",
    hasVision: true,
    description: "Our most intelligent model to date",
    strengths: "Highest level of intelligence and capability",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    price: {
      input: 24.0,
      output: 120.0,
      cachingWrite: 30.0,
      cachingRead: 2.4,
    },
  },
  {
    name: "claude-3-5-haiku-20241022",
    displayName: "Claude 3.5 Haiku",
    hasVision: false,
    description: "Fastest, most cost-effective model",
    strengths: "Quick and accurate targeted performance",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    price: {
      input: 6.4,
      output: 32.0,
      cachingWrite: 8.0,
      cachingRead: 0.64,
    },
  },
  {
    name: "claude-3-opus-20240229",
    displayName: "Claude 3 Opus",
    hasVision: true,
    description: "Powerful model for complex tasks",
    strengths: "Best for complex reasoning and specialized tasks",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    price: {
      input: 120.0,
      output: 600.0,
      cachingWrite: 150.0,
      cachingRead: 12.0,
    },
  },
];
