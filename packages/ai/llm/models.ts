export type ModelPrice = {
	[key: string]: { input: number; output: number };
};
import { ollamaModels } from "integrations/ollama/models";

export const allModels = {
	...ollamaModels,
};
