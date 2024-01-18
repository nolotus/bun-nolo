import { pick } from "rambda";

export const pickAiRequstBody = (body) => {
	const propertiesToPick = [
		"model",
		"presence_penalty",
		"frequency_penalty",
		"top_k",
		"top_p",
		"temperature",
		"max_tokens",
	];
	return pick(propertiesToPick, body);
};
