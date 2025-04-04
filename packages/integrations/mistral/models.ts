import { Model } from "ai/llm/types";

export const mistralModels: Model[] = [
  {
    name: "mistral-large-latest",
    displayName: "Mistral Large 24.11",
    hasVision: false,
    description:
      "Top-tier reasoning for high-complexity tasks and sophisticated problems",
    contextWindow: 128000,
    price: {
      input: 16, // $2 * 8
      output: 48, // $6 * 8
    },
  },
  {
    name: "pixtral-large-latest",
    displayName: "Pixtral Large",
    hasVision: true,
    description:
      "Vision-capable large model with frontier reasoning capabilities",
    contextWindow: 128000,
    price: {
      input: 16, // $2 * 8
      output: 48, // $6 * 8
    },
  },
  {
    name: "mistral-small-latest",
    displayName: "Mistral Small 24.09",
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
    name: "codestral-latest",
    displayName: "Codestral",
    hasVision: false,
    description:
      "State-of-the-art Mistral model trained specifically for code tasks",
    contextWindow: 256000,
    price: {
      input: 2.4, // $0.3 * 8
      output: 7.2, // $0.9 * 8
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
];
