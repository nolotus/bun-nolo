import { Model } from "ai/llm/types";

export const mistralModels: Model[] = [
  {
    name: "mistral-medium-latest",
    displayName: "Mistral Medium",
    hasVision: true,
    description:
      "Balanced model for a wide range of tasks, offering a good trade-off between performance and cost",
    contextWindow: 128000,
    price: {
      input: 4, // $0.4 * 10
      output: 20, // $2 * 10
    },
  },
  {
    name: "mistral-small-latest",
    displayName: "Mistral Small",
    hasVision: false,
    description:
      "Cost-efficient, fast, and reliable option for use cases such as translation, summarization, and sentiment analysis",
    contextWindow: 32000,
    price: {
      input: 1, // $0.1 * 10
      output: 3, // $0.3 * 10
    },
  },
  {
    name: "devstral-medium-2507",
    displayName: "Devstral Medium",
    hasVision: true,
    description:
      "A versatile model designed for a wide range of tasks with enhanced capabilities.",
    contextWindow: 128000,
    price: {
      input: 4, // $0.4 * 10
      output: 20, // $2 * 10
    },
  },
  {
    name: "magistral-medium-2506",
    displayName: "Magistral Medium (Preview)",
    hasVision: true,
    description:
      "Thinking model excelling in domain-specific, transparent, and multilingual reasoning.",
    contextWindow: 40000,
    price: {
      input: 2 * 10, // $2 per million tokens
      output: 5 * 10, // $5 per million tokens
    },
    supportsReasoningEffort: true, // Supports reasoning effort
  },
  {
    name: "magistral-small-2506",
    displayName: "Magistral Small",
    hasVision: true,
    description:
      "Thinking model excelling in domain-specific, transparent, and multilingual reasoning.",
    contextWindow: 40000,
    price: {
      input: 0.5 * 10, // $0.5 per million tokens
      output: 1.5 * 10, // $1.5 per million tokens
    },
    supportsReasoningEffort: true, // Supports reasoning effort
  },
];
