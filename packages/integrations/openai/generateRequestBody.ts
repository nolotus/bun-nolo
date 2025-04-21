import { pipe, flatten, filter, reverse, map } from "rambda"; // map 可能不再需要用于转换 content
import { NoloRootState } from "app/store";
import { generatePrompt } from "ai/prompt/generatePrompt";

// --- 类型定义 ---

// 1. 定义 OpenAI 兼容的内容部分类型
type MessageContentPartText = {
  type: "text";
  text: string;
};

type MessageContentPartImageUrl = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "low" | "high" | "auto"; // 可选清晰度
  };
};

// 2. 合并内容部分类型
type MessageContentPart = MessageContentPartText | MessageContentPartImageUrl;

// 3. 更新核心 Message 接口
interface Message {
  role: "user" | "assistant" | "system" | "tool"; // 明确角色类型
  content: string | MessageContentPart[]; // 关键：content 可以是字符串或部件数组
  id?: string; // 可选 ID
  name?: string; // 用于 tool/function calling
  // 根据需要保留或移除其他字段
  // images?: any; // 这个字段在 OpenAI multipart 格式下通常不再需要
  // userId?: string;
  tool_calls?: any; // For assistant role
  tool_call_id?: string; // For tool role
}

// 4. 定义 createUserMessage 的输入部分类型 (来自 MessageInput)
type UserInputPart = {
  type: "text" | "image_url" | "excel"; // 明确类型
  text?: string;
  data?: any; // 主要用于 Excel 原始数据
  image_url?: { url: string }; // 来自 MessageInput 的原始图片结构
  name?: string; // 用于 Excel 文件名
};

// 5. CybotConfig 保持不变
interface CybotConfig {
  provider: string;
  model: string;
  prompt?: string;
  name?: string;
  [key: string]: any;
}

// --- 函数实现 ---

/**
 * 重构：过滤历史消息，保留其原始 content 结构（字符串或数组）。
 * 不再将数组内容强制转换为字符串。
 */
const filterValidMessages = (msgs: any[]): Message[] => {
  // 使用 Ramda pipe 进行组合
  return pipe(
    flatten, // 如果 msgs 可能包含嵌套数组，则保留
    filter((msg: any): msg is Message => {
      // 使用类型守卫进行过滤和类型检查
      // 基础检查：必须是对象，有 role 属性
      if (!msg || typeof msg !== "object" || !msg.role) {
        return false;
      }
      // 检查 content：字符串必须非空，数组必须包含有效部分
      if (typeof msg.content === "string") {
        return msg.content.trim() !== "";
      } else if (Array.isArray(msg.content)) {
        // 数组内容必须至少包含一个非空文本部分或一个有效的图片部分
        return (
          msg.content.length > 0 &&
          msg.content.some(
            (part) =>
              (part.type === "text" &&
                typeof part.text === "string" &&
                part.text.trim() !== "") ||
              (part.type === "image_url" &&
                part.image_url &&
                typeof part.image_url.url === "string" &&
                part.image_url.url.trim() !== "")
          )
        );
      }
      // 如果 content 既不是字符串也不是有效数组，则过滤掉
      return false;
    }),
    // 移除之前强制转换 content 为 string 的 map 步骤
    reverse // 保留反转，如果 API 需要按时间顺序排列历史记录（最近的在最后）
  )(msgs) as Message[]; // 确保返回类型是 Message[]
};

/**
 * 创建用户消息对象，根据输入内容决定 content 是字符串还是数组。
 * (使用之前优化过的版本)
 */
const createUserMessage = (userInput: string | UserInputPart[]): Message => {
  // 1. 处理纯文本输入
  if (typeof userInput === "string") {
    return { role: "user", content: userInput };
  }

  // 2. 处理数组输入
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
          if (item.image_url && item.image_url.url) {
            contentParts.push({
              type: "image_url",
              image_url: { url: item.image_url.url /*, detail: 'auto' */ },
            });
            hasImage = true;
          }
          break;
        case "excel":
          // Excel 转文本，作为 text 部分加入
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
                      .map((key) => {
                        const value = row[key];
                        return value === undefined || value === null
                          ? ""
                          : String(value);
                      })
                      .join("\t")
                  )
                  .join("\n");
                excelText = `[Excel 文件: ${fileName}]\n${header}\n${rows}`;
              } else {
                excelText = `[Excel 文件: ${fileName} (首行为空或无效)]`;
              }
            } catch (e) {
              console.error("Error processing excel data to text:", e);
              excelText = `[Excel 文件: ${fileName} (处理时出错)]`;
            }
          } else {
            excelText = `[Excel 文件: ${fileName} (无数据或格式无效)]`;
          }
          if (excelText) {
            contentParts.push({ type: "text", text: excelText });
          }
          break;
        default:
          console.warn(`Unhandled user input part type: ${item.type}`);
          break;
      }
    });

    // 3. 根据是否包含图片决定 content 格式
    if (hasImage) {
      // 包含图片，content 必须是数组
      return { role: "user", content: contentParts };
    } else {
      // 仅文本（或Excel转文本），合并为字符串 (或者你也可以选择总是返回数组)
      const combinedText = contentParts
        .map((part) => (part.type === "text" ? part.text : ""))
        .filter(Boolean)
        .join("\n\n"); // 用换行符合并
      return { role: "user", content: combinedText };
    }
  }

  // 4. 处理无效输入
  console.error("Invalid userInput type for createUserMessage:", userInput);
  return { role: "user", content: "" };
};

/**
 * 生成系统提示（保持不变）
 */
const generateSystemPrompt = (
  prompt: string | undefined,
  botName: string | undefined,
  language: string,
  context: any
): string => {
  // 假设 generatePrompt 能正确处理 undefined prompt
  return generatePrompt(prompt || "", botName, language, context);
};

/**
 * 在消息列表前添加系统提示（保持不变）
 */
const prependPromptMessage = (
  messages: Message[],
  promptContent: string
): Message[] => {
  // 确保 promptContent 不为空
  if (promptContent.trim()) {
    return [{ role: "system", content: promptContent }, ...messages];
  }
  return messages; // 如果 prompt 为空则不添加
};

/**
 * 构建请求体（基本保持不变，接收的 messages 结构已更新）
 */
const buildRequestBody = (
  model: string,
  messages: Message[], // 现在这里的 Message[] 包含了正确格式的 content
  providerName: string
): any => {
  const bodyData: any = {
    model,
    messages, // 直接使用传入的 messages 数组
    stream: true, // 假设总是需要流式传输
  };

  // 添加特定 provider 的选项（保持不变）
  if (
    providerName === "google" ||
    providerName === "openrouter" ||
    providerName === "xai"
  ) {
    bodyData.stream_options = { include_usage: true };
  }
  if (providerName === "xai" && model.includes("grol3-mini")) {
    bodyData.reasoning_effort = "high";
    bodyData.temperature = 0.7;
  }

  return bodyData;
};

/**
 * 主函数：生成 OpenAI 请求体（逻辑不变，但调用的函数已更新）
 */
export const generateOpenAIRequestBody = (
  state: NoloRootState,
  userInput: string | UserInputPart[], // 使用更新后的 UserInputPart[] 类型
  cybotConfig: CybotConfig,
  providerName: string,
  context: any = "" // context 类型可以更具体
) => {
  // 1. 从 state 获取并过滤历史消息，保留原始结构
  // 注意：确保 state.message.msgs 存储的是兼容 Message 接口的对象数组
  const previousMessages = filterValidMessages(state.message.msgs || []); // 添加空数组默认值

  // 2. 创建新的用户消息，格式会自动适应（字符串或数组 content）
  const newUserMessage = createUserMessage(userInput);

  // 3. 合并历史消息和新消息
  const conversationMessages = [...previousMessages, newUserMessage];

  // 4. 生成系统提示文本
  const promptContent = generateSystemPrompt(
    cybotConfig.prompt,
    cybotConfig.name,
    navigator.language, // 考虑从配置或状态获取语言
    context
  );

  // 5. 将系统提示添加到消息列表开头
  const messagesWithPrompt = prependPromptMessage(
    conversationMessages,
    promptContent
  );

  // 6. 构建最终的请求体
  const requestBody = buildRequestBody(
    cybotConfig.model,
    messagesWithPrompt, // 包含结构正确的 messages
    providerName
  );

  return requestBody;
};
