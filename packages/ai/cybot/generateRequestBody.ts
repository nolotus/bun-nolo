import { RootState } from "app/store";
import { BotConfig } from "app/types";
import { generateOpenAIRequestBody } from "integrations/openai/generateRequestBody";

export const generateRequestBody = (
  state: RootState,
  cybotConfig: BotConfig,
  contexts?: any
) => {
  const providerName = cybotConfig.provider.toLowerCase();

  return generateOpenAIRequestBody(state, cybotConfig, providerName, contexts);
};
