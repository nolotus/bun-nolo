import { SpaceData, Contents, ContentType } from "create/space/types";
import { Message } from "chat/messages/types"; // 假设 Message 类型定义在此处

/**
 * 将 Space 的 contents 和历史消息转换为字符串格式，供 API 或 AI 使用。
 * @param spaceData 当前空间的数据，包含 contents。
 * @param messages 过滤和清理后的历史消息数组。
 * @returns 格式化为字符串的数据，包含 contents 和 messages 的信息。
 */
export const formatDataForApi = (
  spaceData: SpaceData,
  messages: Message[]
): string => {
  // 1. 格式化 Space 的 contents
  const contents = spaceData.contents;
  const contentsStr = formatContentsToString(contents);

  // 2. 格式化历史消息
  const messagesStr = formatMessagesToString(messages);

  // 3. 组合成最终字符串
  const result = `=== Space Contents ===\n${contentsStr}\n\n=== Historical Messages ===\n${messagesStr}`;
  return result;
};

/**
 * 将 Space 的 contents 转换为字符串格式。
 * @param contents Space 的内容列表。
 * @returns 格式化后的字符串。
 */
const formatContentsToString = (contents: Contents): string => {
  // 过滤掉 null 内容
  const validContents = Object.entries(contents).filter(
    ([_, content]) => content !== null
  );

  // 如果没有有效内容，返回提示信息
  if (validContents.length === 0) {
    return "No contents available.";
  }

  // 格式化每个内容项为字符串，只保留 Type: page 的内容
  return validContents
    .map(([key, content]) => {
      if (!content || content.type !== ContentType.PAGE) return ""; // 防止 null 情况并只保留 page 类型
      return (
        `ID: ${key}\n` +
        `Title: ${content.title}\n` +
        `Type: ${content.type}\n` +
        `ContentKey: ${content.contentKey}\n` +
        `CategoryID: ${content.categoryId || "Uncategorized"}\n` +
        // 去掉 Pinned 字段
        `CreatedAt: ${new Date(content.createdAt).toISOString()}\n` +
        `UpdatedAt: ${new Date(content.updatedAt).toISOString()}\n` +
        `Order: ${content.order || "N/A"}\n` +
        `Tags: ${content.tags?.join(", ") || "None"}\n` +
        `---`
      );
    })
    .filter((str) => str !== "") // 移除空字符串
    .join("\n");
};

/**
 * 将历史消息转换为字符串格式。
 * @param messages 过滤和清理后的消息数组。
 * @returns 格式化后的字符串。
 */
const formatMessagesToString = (messages: Message[]): string => {
  // 如果没有消息，返回提示信息
  if (messages.length === 0) {
    return "No messages available.";
  }

  // 格式化每条消息为字符串
  return messages
    .map((msg, index) => {
      let contentStr = "";
      // 处理内容为字符串的情况
      if (typeof msg.content === "string") {
        contentStr = msg.content;
      }
      // 处理内容为数组的情况（如包含文本和图片）
      else if (Array.isArray(msg.content)) {
        contentStr = msg.content
          .map((part) => {
            if (part.type === "text") return `Text: ${part.text}`;
            if (part.type === "image_url")
              return `Image URL: ${part.image_url.url}`;
            return "";
          })
          .filter((part) => part !== "") // 移除无效部分
          .join("\n");
      }

      // 组合消息的角色、内容和其他可选字段
      return (
        `Message ${index + 1}:\n` +
        `Role: ${msg.role}\n` +
        `Content:\n${contentStr}\n` +
        `${msg.name ? `Name: ${msg.name}\n` : ""}` +
        `${msg.tool_calls ? `Tool Calls: ${JSON.stringify(msg.tool_calls)}\n` : ""}` +
        `${msg.tool_call_id ? `Tool Call ID: ${msg.tool_call_id}\n` : ""}` +
        `---`
      );
    })
    .join("\n");
};
