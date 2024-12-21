import type { Model } from "ai/llm/types";

export const fireworksmodels: Model[] = [
	{
		name: "accounts/fireworks/models/llama-v3p1-405b-instruct",
		displayName: "LLaMA V3.1 405B",
		hasVision: false,
		contextWindow: 131072,
		price: {
			input: 3,
			output: 3,
		},
		speed: 73,
	},
	{
		name: "accounts/fireworks/models/qwen2p5-coder-32b-instruct",
		displayName: "Qwen 2.5 Coder 32B",
		hasVision: false,
		contextWindow: 32768,
		price: {
			input: 0.9,
			output: 0.9,
		},
	},
	{
		name: "accounts/fireworks/models/qwen2p5-72b-instruct",
		displayName: "Qwen 2.5 72B",
		hasVision: false,
		contextWindow: 32768,
		price: {
			input: 0.9,
			output: 0.9,
		},
	},
	{
		name: "accounts/fireworks/models/llama-v3p3-70b-instruct",
		displayName: "LLaMA V3.3 70B",
		hasVision: false,
		contextWindow: 131072,
		price: {
			input: 0.9,
			output: 0.9,
		},
	},
	{
		name: "accounts/fireworks/models/llama-v3p1-8b-instruct",
		displayName: "LLaMA V3.1 8B",
		hasVision: false,
		contextWindow: 131072,
		price: {
			input: 0.2,
			output: 0.2,
		},
	},
];
