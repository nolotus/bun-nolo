// /ai/llm/generateRequestBody.ts
import { Agent, Message } from "app/types";
import { generateOpenAIRequestBody } from "integrations/openai/generateOpenAIRequestBody";
import { generateResponseRequestBody } from "integrations/openai/generateResponseRequestBody";

export const generateRequestBody = (
  agentConfig: Agent,
  messages: Message[],
  contexts?: any
) => {
  const provider = agentConfig.provider.toLowerCase();
  const endpointKey = agentConfig.endpointKey;

  // 如果是 OpenAI 且 endpointKey 标记了要走新版 /v1/responses
  if (provider === "openai" && endpointKey === "responses") {
    return generateResponseRequestBody(agentConfig, messages, contexts);
  }

  // 否则走老的 chat/completions
  return generateOpenAIRequestBody(agentConfig, provider, messages, contexts);
};
