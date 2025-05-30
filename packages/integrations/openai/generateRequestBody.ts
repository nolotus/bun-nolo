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

type UserInputPart = {
  type: "text" | "image_url" | "excel";
  text?: string;
  image_url?: { url: string };
  name?: string;
};

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
  // 后续可以按需增加参数
}

/**
 * 创建用户消息对象
 */
const createUserMessage = (userInput: string | UserInputPart[]): Message => {
  if (typeof userInput === "string") {
    return { role: "user", content: userInput };
  }

  if (Array.isArray(userInput)) {
    const contentParts: MessageContentPart[] = [];
    let hasImage = false;

    userInput.forEach((item) => {
      switch (item.type) {
        case "text":
          if (item.text?.trim()) {
            contentParts.push({ type: "text", text: item.text.trim() });
          }
          break;
        case "image_url":
          if (item.image_url?.url) {
            contentParts.push({
              type: "image_url",
              image_url: { url: item.image_url.url },
            });
            hasImage = true;
          }
          break;
        case "excel":
          // 只用 text 字段
          const excelText =
            item.text?.trim() ||
            `[Excel 文件: ${item.name || "未知Excel文件"} (无内容)]`;
          contentParts.push({ type: "text", text: excelText });
          break;
        default:
          break;
      }
    });

    if (hasImage) {
      return { role: "user", content: contentParts };
    } else {
      // 仅文本，合并为一个字符串
      const combinedText = contentParts
        .map((part) => (part.type === "text" ? part.text : ""))
        .filter(Boolean)
        .join("\n\n");
      return { role: "user", content: combinedText };
    }
  }

  console.error("Invalid userInput for createUserMessage:", userInput);
  return { role: "user", content: "" };
};

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
  if (providerName === "xai" && model.includes("grok3-mini")) {
    bodyData.reasoning_effort = "high";
    bodyData.temperature = 0.7;
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
 * cybotConfig 只用于挑选所需字段，最终只把所需参数传递给 buildRequestBody
 */
export const generateOpenAIRequestBody = (
  state: NoloRootState,
  userInput: string | UserInputPart[],
  cybotConfig: {
    model: string;
    prompt?: string;
    name?: string;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    max_tokens?: number;
    [key: string]: any;
  },
  providerName: string,
  context: any = ""
) => {
  // 1. 获取清理历史消息
  const previousMessages = filterAndCleanMessages(selectAllMsgs(state));

  // 2. 创建新的用户消息
  const newUserMessage = createUserMessage(userInput);

  // 3. 合并消息（历史消息+新消息）
  const conversationMessages = [...previousMessages, newUserMessage];

  // 4. 生成 system prompt
  const promptContent = generateSystemPrompt(
    cybotConfig.prompt,
    cybotConfig.name,
    navigator.language,
    context
  );

  // 5. 消息队头插入 prompt
  const messagesWithPrompt = prependPromptMessage(
    conversationMessages,
    promptContent
  );

  // 6. 优雅地只挑所需字段构建请求体（不重复也不全传递）
  const requestBody = buildRequestBody({
    model: cybotConfig.model,
    messages: messagesWithPrompt,
    providerName,
    temperature: cybotConfig.temperature,
    top_p: cybotConfig.top_p,
    frequency_penalty: cybotConfig.frequency_penalty,
    presence_penalty: cybotConfig.presence_penalty,
    max_tokens: cybotConfig.max_tokens,
  });

  return requestBody;
};
