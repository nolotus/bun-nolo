import { Model } from "ai/llm/types";

export const mistralModels: Model[] = [
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
];
