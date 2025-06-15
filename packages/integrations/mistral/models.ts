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
      input: 3.2, // $0.4 * 8
      output: 16, // $2 * 8
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
      input: 0.8, // $0.1 * 8
      output: 2.4, // $0.3 * 8
    },
  },
  {
    name: "mistral-ocr-latest",
    displayName: "Mistral OCR",
    hasVision: true,
    description: "OCR-capable model for extracting text from images",
    contextWindow: 32000,
    price: {},
  },
  {
    name: "magistral-medium-2506",
    displayName: "Magistral Medium (Preview)",
    hasVision: true,
    description:
      "Thinking model excelling in domain-specific, transparent, and multilingual reasoning.",
    contextWindow: 40000,
    price: {
      input: 2 * 8, // $2 per million tokens
      output: 5 * 8, // $5 per million tokens
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
      input: 0.5 * 8, // $0.5 per million tokens
      output: 1.5 * 8, // $1.5 per million tokens
    },
    supportsReasoningEffort: true, // Supports reasoning effort
  },
];
