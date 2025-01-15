// File: integrations/google/ai/models.js

import type { Model } from "ai/llm/types";

export const googleModels: Model[] = [
  // {
  //   name: "models/gemini-1.5-pro",
  //   displayName: "Gemini 1.5 Pro",
  //   provider: "google",
  //   description: "Most capable model for a wide range of tasks",
  //   strengths: "Highest level of intelligence and capability",
  //   hasVision: true,
  //   hasAudio: true,
  //   contextWindow: 128000,
  //   maxOutputTokens: 2048,
  //   price: {
  //     input: 0.075,
  //     output: 0.3,
  //   },
  //   performance: {
  //     latency: "medium",
  //   },
  // },
  // {
  //   name: "models/gemini-1.5-flash",
  //   displayName: "Gemini 1.5 Flash",
  //   provider: "google",
  //   description: "High speed model with flexible pricing",
  //   strengths: "Cost-effective for extended prompts",
  //   hasVision: true,
  //   hasAudio: true,
  //   contextWindow: 128000,
  //   maxOutputTokens: 2048,
  //   price: {
  //     input: 0.075,
  //     output: 0.3,
  //   },
  //   performance: {
  //     latency: "medium",
  //   },
  // },
  {
    name: "models/gemini-2.0-flash-thinking-exp-1219",
    displayName: "Gemini 2.0 Flash Thinking (Experimental)",
    provider: "google",
    description:
      "Experimental thinking model based on Gemini 2.0 Flash with specific limitations.",
    strengths: "Potentially strong in reasoning tasks within its constraints.",
    hasVision: true,
    hasAudio: false,
    contextWindow: 32000,
    maxOutputTokens: 8192,
    price: {
      input: 0,
      output: 0,
    },
    performance: {
      latency: "medium",
    },
    limitations: [
      "32k token input limit",
      "Text and image input only",
      "8k token output limit",
      "Text only output",
      "No built-in tool usage like Search or code execution",
    ],
  },
  {
    name: "models/gemini-2.0-flash-exp",
    displayName: "Gemini 2.0 Flash (Experimental)", // Added "Experimental" to the display name
    provider: "google",
    description: "Experimental version of Gemini 2.0 Flash.",
    strengths:
      "Potentially inherits the speed and efficiency of Gemini 2.0 Flash.",
    hasVision: true, // Assuming it has vision capabilities like other Flash models, please verify
    hasAudio: true, // Assuming it has audio capabilities like other Flash models, please verify
    contextWindow: 128000, // Assuming similar context window to other Flash models, please verify
    maxOutputTokens: 2048, // Assuming similar output tokens to other Flash models, please verify
    price: {
      input: 0, // Please verify the actual pricing
      output: 0, // Please verify the actual pricing
    },
    performance: {
      latency: "medium", // Please verify the actual latency
    },
    // You might want to add a 'notes' or 'status' field to indicate it's experimental
  },
];
