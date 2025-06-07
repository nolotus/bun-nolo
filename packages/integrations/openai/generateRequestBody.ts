import { NoloRootState } from "app/store";
import { generatePrompt } from "ai/prompt/generatePrompt";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { filterAndCleanMessages } from "integrations/openai/filterAndCleanMessages";

// --- 类型定义 ---

type MessageContentPartText = {
  type: "text";
  text: string;
};

type MessageContentPartImageUrl = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "low" | "high" | "auto";
  };
};

type MessageContentPart = MessageContentPartText | MessageContentPartImageUrl;

interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string | MessageContentPart[];
  name?: string;
  tool_calls?: any;
  tool_call_id?: string;
}

// 只传必要配置
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

/**
 * 生成系统提示
 */
const generateSystemPrompt = (
  prompt: string | undefined,
  botName: string | undefined,
  language: string,
  context: any
): string => {
  return generatePrompt(prompt || "", botName, language, context);
};

/**
 * 在消息列表前添加系统提示
 */
const prependPromptMessage = (
  messages: Message[],
  promptContent: string
): Message[] => {
  if (promptContent.trim()) {
    const systemMessage: Message = { role: "system", content: promptContent };
    return [systemMessage, ...messages];
  }
  return messages;
};

/**
 * 只传必要字段，构建请求体
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
  if (reasoning_effort) {
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
  state: NoloRootState,
  cybotConfig: {
    model: string;
    prompt?: string;
    name?: string;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    max_tokens?: number;
    reasoning_effort?: string;
    [key: string]: any;
  },
  providerName: string,
  context: any = ""
) => {
  // 1. 获取清理历史消息
  const previousMessages = filterAndCleanMessages(selectAllMsgs(state));

  // 4. 生成 system prompt
  const promptContent = generateSystemPrompt(
    cybotConfig.prompt,
    cybotConfig.name,
    navigator.language,
    context
  );

  // 5. 消息队头插入 prompt
  const messagesWithPrompt = prependPromptMessage(
    previousMessages,
    promptContent
  );

  // 6. 构建请求体
  const requestBody = buildRequestBody({
    model: cybotConfig.model,
    messages: messagesWithPrompt,
    providerName,
    temperature: cybotConfig.temperature,
    top_p: cybotConfig.top_p,
    frequency_penalty: cybotConfig.frequency_penalty,
    presence_penalty: cybotConfig.presence_penalty,
    max_tokens: cybotConfig.max_tokens,
    reasoning_effort: cybotConfig.reasoning_effort,
  });

  return requestBody;
};
