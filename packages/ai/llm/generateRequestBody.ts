// /ai/llm/generateRequestBody.ts

import { Agent } from "app/types";
import {
  generateOpenAIRequestBody,
  Message,
} from "integrations/openai/generateRequestBody";

/**
 * 根据 provider 生成请求体。
 * 目前只支持 OpenAI 兼容的格式，将来可扩展。
 */
export const generateRequestBody = (
  agentConfig: Agent,
  messages: Message[], // 接收准备好的消息数组
  contexts?: any
) => {
  const providerName = agentConfig.provider.toLowerCase();

  // 传递消息数组给下一层
  return generateOpenAIRequestBody(
    agentConfig,
    providerName,
    messages,
    contexts
  );
};
