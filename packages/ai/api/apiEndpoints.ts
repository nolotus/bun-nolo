// apiEndpoints.js
export const API_ENDPOINTS = {
	OPENAI: "https://api.openai.com/v1/chat/completions",
	DEEPINFRA: "https://api.deepinfra.com/v1/openai/chat/completions",
	FIREWORKS: "https://api.fireworks.ai/inference/v1/chat/completions",
	XAI: "https://api.x.ai/v1/chat/completions",
	DEEPSEEK: "https://api.deepseek.com/chat/completions",
	MISTRAL: "https://api.mistral.ai/v1/chat/completions",
};

export function getApiEndpoint(provider) {
	switch (provider) {
		case "openai":
			return API_ENDPOINTS.OPENAI;
		case "deepinfra":
			return API_ENDPOINTS.DEEPINFRA;
		case "fireworks":
			return API_ENDPOINTS.FIREWORKS;
		case "xai":
			return API_ENDPOINTS.XAI;
		case "deepseek":
			return API_ENDPOINTS.DEEPSEEK;
		case "mistral":
			return API_ENDPOINTS.MISTRAL;
		default:
			throw new Error(`Unsupported provider: ${provider}`);
	}
}
