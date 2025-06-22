import { RootState } from "app/store";
import { generatePrompt } from "ai/llm/generatePrompt";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { filterAndCleanMessages } from "integrations/openai/filterAndCleanMessages";
import { supportedReasoningModels } from "ai/llm/providers";
import { BotConfig } from "app/types";

// 类型定义保持不变...
type MessageContentPartText = { type: "text"; text: string };
type MessageContentPartImageUrl = {
  type: "image_url";
  image_url: { url: string; detail?: "low" | "high" | "auto" };
};
type MessageContentPart = MessageContentPartText | MessageContentPartImageUrl;
interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string | MessageContentPart[];
  name?: string;
  tool_calls?: any;
  tool_call_id?: string;
}
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

interface Contexts {
  currentUserContext?: string | null;
  smartReadContext?: string | null;
  historyContext?: string | null;
  preConfiguredContext?: string | null;
}

/**
 * 在消息列表前添加系统提示
 */
const prependPromptMessage = (
  messages: Message[],
  agentConfig: BotConfig,
  language: string,
  contexts: Contexts
): Message[] => {
  const promptContent = generatePrompt({
    agentConfig,
    language,
    contexts,
  });

  if (promptContent.trim()) {
    const systemMessage: Message = { role: "system", content: promptContent };
    return [systemMessage, ...messages];
  }
  return messages;
};

/**
 * 检查模型是否支持 reasoning_effort
 */
const isModelSupportReasoningEffort = (model: string): boolean => {
  return supportedReasoningModels.includes(model);
};

/**
 * 构建请求体
 */
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

  const bodyData: any = {
    model,
    messages,
    stream: true,
  };

  // Provider-specific options
  if (
    ["google", "openrouter", "xai", "openai", "deepinfra"].includes(
      providerName
    )
  ) {
    bodyData.stream_options = { include_usage: true };
  }

  // 通用的 reasoning_effort 处理
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
 * 主函数
 */
export const generateOpenAIRequestBody = (
  state: RootState,
  agentConfig: BotConfig,
  providerName: string,
  contexts: Contexts
) => {
  // 1. 获取清理历史消息
  const previousMessages = filterAndCleanMessages(selectAllMsgs(state));

  // 2. 消息队头插入 prompt
  const messagesWithPrompt = prependPromptMessage(
    previousMessages,
    agentConfig,
    navigator.language,
    contexts
  );

  // 3. 构建请求体
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
