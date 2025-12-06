// /integrations/openai/generateOpenAIRequestBody.ts
import { Agent, Message } from "app/types";

import { supportedReasoningModels } from "ai/llm/providers";
import { Contexts } from "ai/types";
import { generatePrompt } from "ai/agent/generatePrompt";

const prependPromptMessage = (
  messages: Message[],
  agentConfig: Agent,
  language: string,
  contexts?: Contexts
): Message[] => {
  // 只有存在上下文或 agentConfig.prompt 时才生成
  if (!contexts && !agentConfig.prompt) {
    return messages;
  }

  const promptContent = generatePrompt({ agentConfig, language, contexts });

  if (promptContent.trim()) {
    const systemMessage: Message = { role: "system", content: promptContent };
    // 过滤掉已有的 system 消息，避免重复
    const userMessages = messages.filter((m) => m.role !== "system");
    return [systemMessage, ...userMessages];
  }
  return messages;
};

interface BuildRequestBodyOptions {
  model: string;
  messages: Message[];
  providerName: string;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
  reasoning_effort?: string;
}

const isModelSupportReasoningEffort = (model: string): boolean => {
  return supportedReasoningModels.includes(model);
};

const buildRequestBody = (options: BuildRequestBodyOptions): any => {
  const {
    model,
    messages,
    providerName,
    temperature,
    top_p,
    frequency_penalty,
    presence_penalty,
    max_tokens,
    reasoning_effort,
  } = options;

  const bodyData: any = { model, messages, stream: true };
  if (model.includes("moonshotai/kimi-k2-thinking")) {
    bodyData.provider = {
      order: ["fireworks", "google-vertex", "moonshotai/int4"],
    };
  }
  if (["google", "openrouter", "xai", "openai"].includes(providerName)) {
    bodyData.stream_options = { include_usage: true };
  }
  if (reasoning_effort && isModelSupportReasoningEffort(model)) {
    bodyData.reasoning_effort = reasoning_effort;
  }
  if (typeof temperature === "number") bodyData.temperature = temperature;
  if (typeof top_p === "number") bodyData.top_p = top_p;
  if (typeof frequency_penalty === "number")
    bodyData.frequency_penalty = frequency_penalty;
  if (typeof presence_penalty === "number")
    bodyData.presence_penalty = presence_penalty;
  if (typeof max_tokens === "number") bodyData.max_tokens = max_tokens;

  return bodyData;
};

/**
 * 主函数：生成完整的 OpenAI 请求体。
 */
export const generateOpenAIRequestBody = (
  agentConfig: Agent,
  providerName: string,
  messages: Message[],
  contexts?: Contexts
) => {
  // 1. 在消息队头插入 prompt (如果需要)
  const messagesWithPrompt = prependPromptMessage(
    messages,
    agentConfig,
    navigator.language,
    contexts
  );

  // 2. 构建请求体
  const requestBody = buildRequestBody({
    model: agentConfig.model,
    messages: messagesWithPrompt,
    providerName,
    temperature: agentConfig.temperature,
    top_p: agentConfig.top_p,
    frequency_penalty: agentConfig.frequency_penalty,
    presence_penalty: agentConfig.presence_penalty,
    max_tokens: agentConfig.max_tokens,
    reasoning_effort: agentConfig.reasoning_effort,
  });

  return requestBody;
};
