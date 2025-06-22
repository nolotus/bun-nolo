import { RootState } from "app/store";
import { BotConfig } from "app/types";
import { generateOpenAIRequestBody } from "integrations/openai/generateRequestBody";

export const generateRequestBody = (
  state: RootState,
  agentConfig: BotConfig,
  contexts?: any
) => {
  console.log("Generating request body for agent:", agentConfig);
  const providerName = agentConfig.provider.toLowerCase();

  return generateOpenAIRequestBody(state, agentConfig, providerName, contexts);
};
