import { anthropicModels } from "integrations/anthropic/models";
// ai/llm/providers.ts
import { deepinfraModels } from "integrations/deepinfra/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { fireworksmodels } from "integrations/fireworks/models";
import { mistralModels } from "integrations/mistral/models";
import { openAIModels } from "integrations/openai/models";
import { xaiModels } from "integrations/xai/models";

import type { Model } from "./types";

export const ollamaModels: Model[] = [
	{ name: "llama2", hasVision: false, price: { input: 0.002, output: 0.004 } },
];

export const providerOptions = [
	"openai",
	"xai",
	"anthropic",
	"ollama",
	"fireworks",
	"deepinfra",
	"deepseek",
	"mistral",
] as const;

export type Provider = (typeof providerOptions)[number];

export const getModelsByProvider = (provider: Provider): Model[] => {
	switch (provider) {
		case "openai":
			return openAIModels;
		case "xai":
			return xaiModels;
		case "anthropic":
			return anthropicModels;
		case "ollama":
			return ollamaModels;
		case "fireworks":
			return fireworksmodels;
		case "deepinfra":
			return deepinfraModels;
		case "deepseek":
			return deepSeekModels;
		case "mistral":
			return mistralModels;
		default:
			return [];
	}
};
