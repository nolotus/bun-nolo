// chat/messages/fetchMessages.ts

/**
 * 从数据库中获取某个对话的最新消息
 * @param db 数据库实例
 * @param dialogId 对话ID
 * @param limit 消息数量限制，默认为1000
 * @param throwOnError 是否在出错时抛出异常，默认为false
 * @returns 消息数组
 */
export const fetchMessages = async (
  db: any,
  dialogId: string,
  limit: number = 1000,
  throwOnError: boolean = false
): Promise<any[]> => {
  if (!dialogId || typeof dialogId !== "string") {
    if (throwOnError) {
      throw new Error("dialogId must be a string");
    }
    return [];
  }

  const messages = [];
  const prefix = `dialog-${dialogId}-msg-`;

  try {
    for await (const [key, value] of db.iterator({
      gte: prefix,
      lte: prefix + "\uffff",
      reverse: true,
      limit,
    })) {
      messages.push(value);
    }
    return messages;
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    if (throwOnError) {
      throw error;
    }
    return [];
  }
};
