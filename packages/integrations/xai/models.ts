import { Model } from "ai/llm/types";

export const xaiModels: Model[] = [
  {
    name: "grok-beta",
    displayName: "Grok Beta",
    hasVision: false,
    price: { input: 0.0005, output: 0.001 },
  },
  {
    name: "grok-vision-beta",
    displayName: "Grok Vision Beta",
    hasVision: true,
    price: { input: 0.0005, output: 0.001 },
  },
];
