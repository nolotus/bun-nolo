// chat/messages/server/fetchConvMsgs.ts
import serverDb from "database/server/db"; // 假设这是服务器端 DB 实例
import { fetchMessages, MessageWithKey } from "../fetchMessages"; // 导入更新后的 fetchMessages
import type { Message } from "../types"; // 基础 Message 类型

// API 端点接收的参数类型
interface FetchConvMsgsParams {
  dialogId: string;
  limit?: number;
  beforeKey?: string | null; // 支持 beforeKey
}

/**
 * 服务器端函数：获取对话消息，支持分页。供 API 端点调用。
 * @param params 包含 dialogId 及可选 limit, beforeKey 的对象，或仅 dialogId 字符串。
 * @returns Promise<Message[]> 返回基础 Message 数组 (不含 _key 给客户端)。
 */
export const fetchConvMsgs = async (
  params: string | FetchConvMsgsParams
): Promise<Message[]> => {
  // API 通常不返回内部 key
  let dialogId: string;
  let limit: number | undefined;
  let beforeKey: string | null | undefined;

  if (typeof params === "string") {
    dialogId = params;
    limit = undefined; // 使用 fetchMessages 默认值
    beforeKey = null;
  } else if (typeof params === "object" && params !== null && params.dialogId) {
    dialogId = params.dialogId;
    limit = params.limit;
    beforeKey = params.beforeKey;
  } else {
    throw new Error("无效参数: 必须提供 dialogId。");
  }

  if (!dialogId || typeof dialogId !== "string") {
    throw new Error("无效的 dialogId。");
  }

  try {
    // 调用 fetchMessages，传递分页参数
    const messagesWithKey: MessageWithKey[] = await fetchMessages(
      serverDb,
      dialogId,
      {
        limit: limit,
        beforeKey: beforeKey,
        throwOnError: true, // API 层面应抛出错误
      }
    );
    // 在返回给客户端前，通常移除内部使用的 _key
    const messagesToReturn = messagesWithKey.map(({ _key, ...msg }) => msg);
    return messagesToReturn; // 返回的消息是 newest first
  } catch (error) {
    console.error(`fetchConvMsgs: 获取对话 ${dialogId} 消息失败:`, error);
    throw error; // 让上层 API 框架处理错误
  }
};
