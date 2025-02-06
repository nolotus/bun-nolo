// 定义 cybotConfig 的类型
interface CybotConfig {
  provider: string;
  customProviderUrl?: string;
}

const CHAT_COMPLETION_URLS = {
  openai: "https://api.openai.com/v1/chat/completions",
  deepinfra: "https://api.deepinfra.com/v1/openai/chat/completions",
  fireworks: "https://api.fireworks.ai/inference/v1/chat/completions",
  xai: "https://api.x.ai/v1/chat/completions",
  deepseek: "https://api.deepseek.com/chat/completions",
  mistral: "https://api.mistral.ai/v1/chat/completions",
  google:
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  ollama: "http://localhost:11434/v1/chat/completions",
  sambanova: "https://api.sambanova.ai/v1/chat/completions", // 新添加的端点
};

export function getApiEndpoint(cybotConfig: CybotConfig): string {
  const provider = cybotConfig.provider.toLowerCase();

  if (provider === "custom") {
    if (!cybotConfig.customProviderUrl) {
      throw new Error(
        "Custom provider URL is required when provider is 'custom'."
      );
    }
    return cybotConfig.customProviderUrl;
  }

  const endpoint = CHAT_COMPLETION_URLS[provider];
  if (!endpoint) {
    throw new Error(`Unsupported provider: ${cybotConfig.provider}`);
  }

  return endpoint;
}
