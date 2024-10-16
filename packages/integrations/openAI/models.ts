export const openAIModels = {
  "gpt-3.5-turbo": { input: 0.5, output: 1.5, tokens: 16385 },
  "gpt-4-turbo": { input: 10, output: 30, tokens: 128000 },
  "gpt-4o": { input: 5, output: 15, tokens: 128000 },
  "gpt-4o-mini": { input: 0.15, output: 0.6, tokens: 128000 },
  "o1-preview": {
    input: 15,
    output: 60,
    tokens: 128000,
    description:
      "o1-preview is our new reasoning model for complex tasks. The model has 128K context and an October 2023 knowledge cutoff.",
    pricing: {
      input: "$15.00 / 1M input tokens",
      cachedInput: "$7.50 / 1M cached* input tokens",
      output: "$60.00 / 1M output** tokens",
    },
  },

  "o1-mini": {
    input: 3,
    output: 12,
    tokens: 128000,
    description:
      "o1-mini is a fast, cost-efficient reasoning model tailored to coding, math, and science use cases. The model has 128K context and an October 2023 knowledge cutoff.",
    pricing: {
      input: "$3.00 / 1M input tokens",
      cachedInput: "$1.50 / 1M cached* input tokens",
      output: "$12.00 / 1M output* tokens",
    },
  },
};
