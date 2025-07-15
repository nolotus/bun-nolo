// /ai/llm/generateRequestBody.ts
import { Agent, Message } from "app/types";
import { Contexts } from "../types";
import { generateOpenAIRequestBody } from "integrations/openai/generateOpenAIRequestBody";
import { generateResponseRequestBody } from "integrations/openai/generateResponseRequestBody";

export interface GenerateRequestBodyArgs {
  agentConfig: Agent;
  messages: Message[]; // 历史消息
  userInput: string; // 本次用户输入
  contexts?: Contexts; // 可选上下文
}

export const generateRequestBody = ({
  agentConfig,
  messages,
  contexts,
}: GenerateRequestBodyArgs) => {
  const provider = agentConfig.provider.toLowerCase();
  const model = agentConfig.model;

  if (provider === "openai" && model === "o3-pro") {
    // 调新版 /v1/responses
    return generateResponseRequestBody(agentConfig, messages, contexts);
  }

  // 调老版 chat/completions
  return generateOpenAIRequestBody(agentConfig, provider, messages, contexts);
};
