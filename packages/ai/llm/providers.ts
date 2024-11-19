// ai/llm/providers.ts
export interface Model {
  name: string;
  hasVision: boolean;
}

export const openaiModels: Model[] = [
  { name: "gpt-3.5-turbo", hasVision: false },
  { name: "gpt-4", hasVision: false },
  { name: "gpt-4-vision-preview", hasVision: true },
];

export const xaiModels: Model[] = [
  { name: "grok-beta", hasVision: false },
  { name: "grok-vision-beta", hasVision: true },
];

export const anthropicModels: Model[] = [
  { name: "claude-1", hasVision: false },
  { name: "claude-2", hasVision: false },
  { name: "claude-3", hasVision: true },
];

export const providerOptions = ["openai", "xai", "anthropic"] as const;

export type Provider = (typeof providerOptions)[number];

export const getModelsByProvider = (provider: Provider): Model[] => {
  switch (provider) {
    case "openai":
      return openaiModels;
    case "xai":
      return xaiModels;
    case "anthropic":
      return anthropicModels;
    default:
      return [];
  }
};
