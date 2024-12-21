// File: integrations/google/ai/models.js

import type { Model } from "ai/llm/types";

export const googleModels: Model[] = [
	{
		name: "models/gemini-1.5-pro",
		displayName: "Gemini 1.5 Pro",
		provider: "google",
		description: "Most capable model for a wide range of tasks",
		strengths: "Highest level of intelligence and capability",
		hasVision: true,
		hasAudio: true,
		contextWindow: 128000,
		maxOutputTokens: 2048,
		price: {
			input: 0.075,
			output: 0.3,
		},
		performance: {
			latency: "medium",
		},
	},
	{
		name: "models/gemini-1.5-flash",
		displayName: "Gemini 1.5 Flash",
		provider: "google",
		description: "High speed model with flexible pricing",
		strengths: "Cost-effective for extended prompts",
		hasVision: true,
		hasAudio: true,
		contextWindow: 128000,
		maxOutputTokens: 2048,
		price: {
			input: 0.075,
			output: 0.3,
		},
		performance: {
			latency: "medium",
		},
	},
];

export const geminiModelNames = Object.keys(googleModels);
