import { NoloRootState } from "app/store";
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
  cybotConfig: CybotConfig,
  context?: any
) => {
  const providerName = cybotConfig.provider.toLowerCase();

  return generateOpenAIRequestBody(state, cybotConfig, providerName, context);
};
