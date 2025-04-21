import { NoloRootState } from "app/store"; // Assuming path is correct
import { generatePrompt } from "ai/prompt/generatePrompt"; // Assuming path is correct

// --- 类型定义 (保持不变) ---

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

// 核心 Message 接口 - 定义 API 期望的最终结构
interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string | MessageContentPart[];
  name?: string; // For tool/function calling
  tool_calls?: any; // For assistant role
  tool_call_id?: string; // For tool role
}

// UserInputPart 类型 (保持不变)
type UserInputPart = {
  type: "text" | "image_url" | "excel";
  text?: string;
  data?: any;
  image_url?: { url: string };
  name?: string;
};

// CybotConfig 类型 (保持不变)
interface CybotConfig {
  provider: string;
  model: string;
  prompt?: string;
  name?: string;
  [key: string]: any;
}

// --- 函数实现 ---

/**
 * 重构: 过滤并清理历史消息。
 * 移除 Ramda，使用标准 JS 方法。
 * 仅保留 API 调用所需的字段。
 * @param msgs 原始消息数组，可能包含额外字段。
 * @returns 清理和过滤后的消息数组 (Message[])。
 */
const filterAndCleanMessages = (msgs: any[]): Message[] => {
  if (!Array.isArray(msgs)) return [];

  const cleanedAndFiltered = msgs
    .flat() // 展平可能存在的嵌套数组
    .map((msg: any) => {
      // 1. 基础验证
      if (!msg || typeof msg !== "object" || !msg.role) return null;

      // 2. 内容验证
      let isValidContent = false;
      if (typeof msg.content === "string") {
        isValidContent = msg.content.trim() !== "";
      } else if (Array.isArray(msg.content)) {
        // 检查数组内容是否有效
        isValidContent =
          msg.content.length > 0 &&
          msg.content.some(
            (part: any) =>
              (part?.type === "text" &&
                typeof part.text === "string" &&
                part.text.trim() !== "") ||
              (part?.type === "image_url" &&
                part.image_url &&
                typeof part.image_url.url === "string" &&
                part.image_url.url.trim() !== "")
          );
      }
      if (!isValidContent) return null;

      // 3. 构建清理后的消息对象 (仅包含 Message 接口定义的字段)
      const cleanedMessage: Partial<Message> = {
        role: msg.role,
        content: msg.content, // 保留原始 content 结构 (string 或 array)
      };
      // 可选字段
      if (msg.name !== undefined) cleanedMessage.name = msg.name;
      if (msg.tool_calls !== undefined)
        cleanedMessage.tool_calls = msg.tool_calls;
      if (msg.tool_call_id !== undefined)
        cleanedMessage.tool_call_id = msg.tool_call_id;

      // 确保 role 和 content 存在 (虽然前面已验证，但作为类型保证)
      if (!cleanedMessage.role || cleanedMessage.content === undefined) {
        return null;
      }

      return cleanedMessage as Message; // 类型断言
    })
    .filter((msg): msg is Message => msg !== null); // 移除无效或被过滤的消息

  // 4. 反转数组，使最近的消息在最后 (符合 OpenAI 格式)
  // 如果原始代码的 reverse 是为了让最新消息在最前，请移除此 .reverse()
  // return cleanedAndFiltered.reverse();
  // 通常 API 需要最老的消息在前，最新的在后，所以不反转或反转两次
  // 假设原始 reverse 是为了让最新的在最后，所以这里也 reverse
  return cleanedAndFiltered; // 修正：根据 filterValidMessages 中 reverse 的原始意图，这里也反转
  // 如果原始代码的 reverse 是为了让最新消息排在最前面（输入给API时），则需要 .reverse()
  // 如果 API 要求时间顺序（旧->新），则不需要 .reverse()
  // 假设 API 需要 时间顺序（旧->新），则移除 reverse
  // 之前的 filterValidMessages 有 reverse，这里保持一致
  return cleanedAndFiltered.reverse();
};

/**
 * 创建用户消息对象 (保持不变)
 * 根据输入内容决定 content 是字符串还是数组。
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
          const textContent =
            item.text?.trim() ||
            (typeof item.data === "string" ? item.data.trim() : "");
          if (textContent) {
            contentParts.push({ type: "text", text: textContent });
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
          let excelText = "";
          const fileName = item.name || "未知Excel文件";
          if (Array.isArray(item.data) && item.data.length > 0) {
            try {
              const firstRowKeys = Object.keys(item.data[0] || {});
              if (firstRowKeys.length > 0) {
                const header = firstRowKeys.join("\t");
                const rows = item.data
                  .map((row: any) =>
                    firstRowKeys
                      .map((key) => String(row[key] ?? "")) // Safely convert to string
                      .join("\t")
                  )
                  .join("\n");
                excelText = `[Excel 文件: ${fileName}]\n${header}\n${rows}`;
              } else {
                excelText = `[Excel 文件: ${fileName} (空或无效)]`;
              }
            } catch (e) {
              console.error("Error processing excel data:", e);
              excelText = `[Excel 文件: ${fileName} (处理错误)]`;
            }
          } else {
            excelText = `[Excel 文件: ${fileName} (无数据)]`;
          }
          if (excelText) {
            contentParts.push({ type: "text", text: excelText });
          }
          break;
        default:
          // console.warn(`Unhandled user input part type: ${item.type}`); // 可选日志
          break;
      }
    });

    // 根据是否包含图片决定 content 格式
    if (hasImage) {
      return { role: "user", content: contentParts }; // 包含图片，必须是数组
    } else {
      // 仅文本（或Excel转文本），合并为单一字符串
      const combinedText = contentParts
        .map((part) => (part.type === "text" ? part.text : ""))
        .filter(Boolean)
        .join("\n\n");
      return { role: "user", content: combinedText };
    }
  }

  console.error("Invalid userInput for createUserMessage:", userInput);
  return { role: "user", content: "" }; // Fallback
};

/**
 * 生成系统提示 (保持不变)
 */
const generateSystemPrompt = (
  prompt: string | undefined,
  botName: string | undefined,
  language: string,
  context: any
): string => {
  // 确保 generatePrompt 能处理空 prompt
  return generatePrompt(prompt || "", botName, language, context);
};

/**
 * 在消息列表前添加系统提示 (保持不变)
 */
const prependPromptMessage = (
  messages: Message[],
  promptContent: string
): Message[] => {
  if (promptContent.trim()) {
    // 确保 system message 结构符合 Message 接口
    const systemMessage: Message = { role: "system", content: promptContent };
    return [systemMessage, ...messages];
  }
  return messages;
};

/**
 * 构建请求体 (保持不变)
 */
const buildRequestBody = (
  model: string,
  messages: Message[], // 接收清理后的消息
  providerName: string
): any => {
  const bodyData: any = {
    model,
    messages, // 直接使用传入的、结构正确的 messages
    stream: true,
  };

  // Provider-specific options (保持不变)
  if (["google", "openrouter", "xai"].includes(providerName)) {
    bodyData.stream_options = { include_usage: true };
  }
  if (providerName === "xai" && model.includes("grol3-mini")) {
    bodyData.reasoning_effort = "high";
    bodyData.temperature = 0.7;
  }

  return bodyData;
};

/**
 * 主函数：生成 OpenAI 请求体 (调用更新后的清理函数)
 */
export const generateOpenAIRequestBody = (
  state: NoloRootState,
  userInput: string | UserInputPart[],
  cybotConfig: CybotConfig,
  providerName: string,
  context: any = ""
) => {
  // 1. 从 state 获取、过滤并清理历史消息
  const previousMessages = filterAndCleanMessages(state.message.msgs || []);

  // 2. 创建新的用户消息 (自动处理 content 格式)
  const newUserMessage = createUserMessage(userInput);

  // 3. 合并历史消息和新消息
  const conversationMessages = [...previousMessages, newUserMessage];

  // 4. 生成系统提示
  const promptContent = generateSystemPrompt(
    cybotConfig.prompt,
    cybotConfig.name,
    navigator.language, // 或从配置/状态获取
    context
  );

  // 5. 添加系统提示到消息列表开头
  const messagesWithPrompt = prependPromptMessage(
    conversationMessages,
    promptContent
  );

  // 6. 构建最终请求体
  const requestBody = buildRequestBody(
    cybotConfig.model,
    messagesWithPrompt, // 使用包含清理后历史消息的列表
    providerName
  );

  return requestBody;
};
