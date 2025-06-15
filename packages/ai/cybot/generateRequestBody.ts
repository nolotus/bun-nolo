import { RootState } from "app/store";
import { generateOpenAIRequestBody } from "integrations/openai/generateRequestBody";

interface CybotConfig {
  provider: string;
  model: string;
  prompt?: string;
  name?: string;
  [key: string]: any;
}

export const generateRequestBody = (
  state: RootState,
  cybotConfig: CybotConfig,
  contexts?: any
) => {
  const providerName = cybotConfig.provider.toLowerCase();

  return generateOpenAIRequestBody(state, cybotConfig, providerName, contexts);
};
