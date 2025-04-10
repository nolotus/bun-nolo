// integrations/anthropic/anthropicModels.ts
import { Model } from "ai/llm/types";

export const anthropicModels: Model[] = [
  {
    name: "claude-3-5-sonnet-latest",
    displayName: "Claude 3.5 Sonnet",
    hasVision: true,
    description: "Our most intelligent model to date",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    price: {
      input: 24.0, // $3/MTok * 8
      output: 120.0, // $15/MTok * 8
      cachingWrite: 30.0, // $3.75/MTok * 8
      cachingRead: 2.4, // $0.30/MTok * 8
    },
  },
  {
    name: "claude-3-7-sonnet-latest",
    displayName: "Claude 3.7 Sonnet",
    hasVision: true,
    description: "Our most intelligent model to date",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    price: {
      input: 24.0, // $3/MTok * 8
      output: 120.0, // $15/MTok * 8
      cachingWrite: 30.0, // $3.75/MTok * 8
      cachingRead: 2.4, // $0.30/MTok * 8
    },
  },
  {
    name: "claude-3-5-haiku-20241022",
    displayName: "Claude 3.5 Haiku",
    hasVision: false,
    description: "Fastest, most cost-effective model",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    price: {
      input: 6.4, // $0.80/MTok * 8
      output: 32.0, // $4/MTok * 8
      cachingWrite: 8.0, // $1/MTok * 8
      cachingRead: 0.64, // $0.08/MTok * 8
    },
  },
];
