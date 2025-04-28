/**
 * 重构：过滤并清理历史消息。
 * 移除 Ramda，使用标准 JS 方法，仅保留 API 调用所需的字段。
 * @param msgs 原始消息数组（期望最新在前，最旧在后）。
 * @returns 清理和过滤后的消息数组（Message[]），按时间顺序（最旧在前，最新在后）。
 */
export const filterAndCleanMessages = (msgs: any[]): Message[] => {
  console.log("filterAndCleanMessages", msgs);
  if (!Array.isArray(msgs)) return [];

  const cleanedAndFiltered = msgs
    .flat() // 展平可能存在的嵌套数组
    .map((msg: any) => {
      // 1. 基础验证：检查消息对象及角色
      if (!msg || typeof msg !== "object" || !msg.role) return null;
      if (!["system", "user", "assistant", "tool"].includes(msg.role))
        return null;

      // 2. 内容验证
      let isValidContent = false;
      if (typeof msg.content === "string") {
        isValidContent = true; // 允许空字符串，若不允许可改为 msg.content.trim() !== ""
      } else if (Array.isArray(msg.content)) {
        // 验证数组内容是否有效
        isValidContent =
          msg.content.length > 0 &&
          msg.content.every(
            (part: any) =>
              part &&
              typeof part === "object" &&
              ((part.type === "text" && typeof part.text === "string") ||
                (part.type === "image_url" &&
                  part.image_url &&
                  typeof part.image_url.url === "string" &&
                  part.image_url.url.trim() !== ""))
          ) &&
          // 确保至少有一个非空文本或图片 URL
          msg.content.some(
            (part: any) =>
              (part.type === "text" && part.text?.trim() !== "") ||
              (part.type === "image_url" && part.image_url?.url?.trim() !== "")
          );
      }
      if (!isValidContent) return null;

      // 3. 构建清理后的消息对象，仅保留必要字段
      const cleanedMessage: Partial<Message> = {
        role: msg.role,
        content: msg.content, // 保留原始内容结构（string 或 array）
      };
      // 添加可选字段
      if (msg.name !== undefined) cleanedMessage.name = msg.name;
      if (msg.role === "assistant" && msg.tool_calls !== undefined)
        cleanedMessage.tool_calls = msg.tool_calls;
      if (msg.role === "tool" && msg.tool_call_id !== undefined)
        cleanedMessage.tool_call_id = msg.tool_call_id;

      // 4. 确保必需字段存在
      if (!cleanedMessage.role || cleanedMessage.content === undefined) {
        console.warn(
          "Skipping message due to missing role or content after cleaning:",
          msg
        );
        return null;
      }

      return cleanedMessage as Message;
    })
    .filter((msg): msg is Message => msg !== null); // 移除无效消息

  return cleanedAndFiltered;
};
