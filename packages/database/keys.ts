// database/keys.ts
import { ulid } from "ulid";
import { DataType } from "create/types";
import { curry } from "rambda";

/**
 * 基础 key 创建函数,使用'-'作为分隔符
 */
export const createKey = (...parts: string[]) => parts.join("-");

/**
 * Token 记录的 key
 * 格式: token-{userId}-{recordId}
 * 用途: 存储用户的 token 使用记录
 * 示例: token-user123-01ARZ3NDEKTSV4RRFFQ69G5FAV
 * TODO:
 * 1. 需要增加按 cybotId 查询的支持: token-cybot-{cybotId}-{recordId}
 * 2. 需要增加全站统计支持: token-stats-day-site-{dateKey}
 */
export const createTokenRecordKey = curry((userId: string, id: string) =>
  createKey("token", userId, id)
);

/**
 * Token 统计的 key
 * 格式: token-stats-day-user-{userId}-{dateKey}
 * 用途: 存储用户每日 token 使用统计
 * 示例: token-stats-day-user-user123-2023-05-20
 */
export const createTokenStatsKey = curry((userId: string, dateKey: string) =>
  createKey("token", "stats", "day", "user", userId, dateKey)
);

/**
 * 对话的 key
 * 格式: dialog-{userId}-{ulid}
 * 用途: 存储用户的对话记录
 * 示例: dialog-user123-01ARZ3NDEKTSV4RRFFQ69G5FAV
 */
export const createDialogKey = (userId: string) =>
  createKey(DataType.DIALOG, userId, ulid());

/**
 * 对话消息的 key
 * 格式: dialog-{dialogId}-msg-{ulid}
 * 用途: 存储对话中的具体消息
 * 示例: dialog-01ARZ3NDEKTSV4RRFFQ69G5FAV-msg-01ARZ3NDEKTSV4RRFFQ69G5FAV
 */
export const createDialogMessageKey = (dialogId: string) =>
  createKey(DataType.DIALOG, dialogId, "msg", ulid());

/**
 * Cybot的 key
 * 格式: cybot-{userId}-{ulid}
 * 用途: 存储用户创建的 AI 助手信息
 * 示例: cybot-user123-01ARZ3NDEKTSV4RRFFQ69G5FAV
 */
export const createCybotKey = (userId: string) =>
  createKey(DataType.CYBOT, userId, ulid());
