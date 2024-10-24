export const claudeModels = {
  "claude-3-5-sonnet-latest": {
    provider: "anthropic",
    name: "Claude 3.5 Sonnet (June 2024)",
    description: "Most intelligent model",
    strengths: "Highest level of intelligence and capability",
    features: {
      multilingual: true,
      vision: true,
    },
    api: {
      name: "claude-3-5-sonnet-latest",
      format: "Messages API",
    },
    performance: {
      latency: "fast",
      contextWindow: null,
      maxOutputTokens: null,
    },
    training: {
      dataCutoff: "2024-04",
    },
    input: 3.0,
    output: 15.0,
  },
  "claude-3-haiku-20240307": {
    provider: "anthropic",
    name: "Claude 3 Haiku (March 2024)",
    description:
      "Fastest and most compact model for near-instant responsiveness",
    strengths: "Quick and accurate targeted performance",
    features: {
      multilingual: true,
      vision: true,
    },
    api: {
      name: "claude-3-haiku-20240307",
      format: "Messages API",
    },
    performance: {
      latency: "fastest",
      contextWindow: null,
      maxOutputTokens: null,
    },
    training: {
      dataCutoff: "2023-08",
    },
    input: 0.25,
    output: 1.25,
  },
};
