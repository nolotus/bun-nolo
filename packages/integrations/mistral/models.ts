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
      input: 1.6, // $0.2 * 8
      output: 4.8, // $0.6 * 8
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
    name: "ministral-8b-latest",
    displayName: "Ministral 8B 24.10",
    hasVision: false,
    description: "Powerful model for on-device use cases",
    contextWindow: 128000,
    price: {
      input: 0.8, // $0.1 * 8
      output: 0.8, // $0.1 * 8
    },
  },
  {
    name: "ministral-3b-latest",
    displayName: "Ministral 3B 24.10",
    hasVision: false,
    description: "Most efficient edge model",
    contextWindow: 128000,
    price: {
      input: 0.32, // $0.04 * 8
      output: 0.32, // $0.04 * 8
    },
  },
  {
    name: "mistral-embed",
    displayName: "Mistral Embed",
    hasVision: false,
    description:
      "State-of-the-art semantic for extracting representation of text extracts",
    contextWindow: 128000,
    price: {
      input: 0.8, // $0.1 * 8
      output: 0, // embedding model 没有输出价格
    },
  },
  {
    name: "mistral-moderation-latest",
    displayName: "Mistral Moderation 24.11",
    hasVision: false,
    description: "A classifier service for text content moderation",
    contextWindow: 128000,
    price: {
      input: 0.8, // $0.1 * 8
      output: 0, // moderation model 没有输出价格
    },
  },
];
