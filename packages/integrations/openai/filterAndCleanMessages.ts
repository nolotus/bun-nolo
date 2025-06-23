/**
 * 类型定义 (假设的 Message 类型)
 */
interface MessagePart {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
    detail?: "low" | "high" | "auto";
  };
}

interface ToolCall {
  // ... tool call 结构
}

interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string | MessagePart[];
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

/**
 * 重构：过滤并清理历史消息。
 * 移除 Ramda，使用标准 JS 方法，仅保留 API 调用所需的字段。
 * @param msgs 原始消息数组。
 * @returns 清理和过滤后的消息数组（Message[]），保留其在原始数组中的相对顺序。
 */
export const filterAndCleanMessages = (msgs: any[]): Message[] => {
  if (!Array.isArray(msgs)) return [];

  const cleanedAndFiltered = msgs
    .flat() // 展平可能存在的嵌套数组
    .map((msg: any): Message | null => {
      // 1. 基础验证：检查消息对象及角色
      if (!msg || typeof msg !== "object" || !msg.role) return null;
      if (!["system", "user", "assistant", "tool"].includes(msg.role))
        return null;

      // 2. 处理并验证内容 (Content)
      let finalContent: string | MessagePart[] | null = null;

      if (typeof msg.content === "string") {
        finalContent = msg.content;
      } else if (Array.isArray(msg.content)) {
        const validParts = msg.content.filter(
          (part: any): part is MessagePart => {
            if (!part || typeof part !== "object") return false;
            return (
              (part.type === "text" && typeof part.text === "string") ||
              (part.type === "image_url" &&
                part.image_url &&
                typeof part.image_url.url === "string" &&
                part.image_url.url.trim() !== "")
            );
          }
        );

        if (validParts.length > 0) {
          finalContent = validParts;
        }
      }

      if (finalContent === null) {
        return null;
      }

      // 3. 构建清理后的消息对象
      const cleanedMessage: Partial<Message> = {
        role: msg.role,
        content: finalContent,
      };
      if (msg.name !== undefined) cleanedMessage.name = msg.name;
      if (msg.role === "assistant" && msg.tool_calls !== undefined)
        cleanedMessage.tool_calls = msg.tool_calls;
      if (msg.role === "tool" && msg.tool_call_id !== undefined)
        cleanedMessage.tool_call_id = msg.tool_call_id;

      return cleanedMessage as Message;
    })
    .filter((msg): msg is Message => msg !== null); // 移除无效消息

  // 直接返回清理和过滤后的结果，不进行排序
  return cleanedAndFiltered;
};
