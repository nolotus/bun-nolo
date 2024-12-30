export const API_ENDPOINTS = {
	OPENAI: "https://api.openai.com/v1/chat/completions",
	DEEPINFRA: "https://api.deepinfra.com/v1/openai/chat/completions",
	FIREWORKS: "https://api.fireworks.ai/inference/v1/chat/completions",
	XAI: "https://api.x.ai/v1/chat/completions",
	DEEPSEEK: "https://api.deepseek.com/chat/completions",
	MISTRAL: "https://api.mistral.ai/v1/chat/completions",
	GOOGLE_GENERATIVE: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
	OLLAMA: "http://localhost:11434/v1/chat/completions",
  };
  

  
  export function getApiEndpoint(cybotConfig) {
	switch (cybotConfig.provider.toLowerCase()) {
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
	  case "google":
		return API_ENDPOINTS.GOOGLE_GENERATIVE;
	  case "ollama":
		return API_ENDPOINTS.OLLAMA;
	  case "custom":
		return cybotConfig.customProviderUrl;
	  default:
		throw new Error(`Unsupported provider: ${cybotConfig.provider}`);
	}
  }
  