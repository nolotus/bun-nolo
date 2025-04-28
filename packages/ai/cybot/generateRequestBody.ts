import { NoloRootState } from "app/store";
import { generateAnthropicRequestBody } from "integrations/anthropic/generateRequestBody";
import { generateOpenAIRequestBody } from "integrations/openai/generateRequestBody";

interface CybotConfig {
  provider: string;
  model: string;
  prompt?: string;
  name?: string;
  [key: string]: any;
}

export const generateRequestBody = (
  state: NoloRootState,
  userInput: string | { type: string; data: string }[],
  cybotConfig: CybotConfig,
  context?: any
) => {
  const providerName = cybotConfig.provider.toLowerCase();

  if (providerName === "anthropic") {
    return generateAnthropicRequestBody(state, userInput, cybotConfig, context);
  }
  return generateOpenAIRequestBody(
    state,
    userInput,
    cybotConfig,
    providerName,
    context
  );
};
