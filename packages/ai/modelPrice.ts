export type ModelPrice = {
	[key: string]: { input: number; output: number };
};
import { openaiModelPrice } from "integrations/openAI/modelPrice";
import { perplexityModelPrice } from "integrations/perplexity/modelPrice";
export const modelPrice = {
	...openaiModelPrice,
	...perplexityModelPrice,
};

export const ModelPriceEnum = Object.keys(modelPrice).reduce(
	(acc, key) => {
		acc[key] = key;
		return acc;
	},
	{} as { [key: string]: string },
);
