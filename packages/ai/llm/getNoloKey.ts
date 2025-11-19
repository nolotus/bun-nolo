import { availableProviderOptions } from "./providers";

export const getNoloKey = (
  provider: (typeof availableProviderOptions)[number]
) => {
  switch (provider) {
    case "mistral":
      return process.env.MISTRAL_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "google":
      return process.env.GOOGLE_API_KEY;
    case "deepseek":
      return process.env.DEEPSEEK_API_KEY;
    case "sambanova":
      return process.env.SAMBA_API_KEY;
    case "openrouter":
      return process.env.OPENROUTER_API_KEY;
    case "openai":
      return process.env.OPENAI_KEY;
    case "xai":
      return process.env.XAI_API_KEY;
    default:
      return null;
  }
};
