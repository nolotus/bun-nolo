import { providerOptions } from "./providers";

export const getNoloKey = (provider: (typeof providerOptions)[number]) => {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_KEY;
    case "mistral":
      return process.env.MISTRAL_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "google":
      return process.env.GOOGLE_API_KEY;
    case "fireworks":
      return process.env.FIREWORKS_API_KEY;
    case "deepinfra":
      return process.env.DEEPINFRA_API_KEY;
    case "deepseek":
      return process.env.DEEPSEEK_API_KEY;
    default:
      return null;
  }
};
