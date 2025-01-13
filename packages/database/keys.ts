// database/keys.ts
import { ulid } from "ulid";
import { curry } from "rambda";
import { pino } from "pino";
import { DataType } from "create/types";

const logger = pino({ name: "db-keys" });

// 基础key创建保持不变
export const createKey = (...parts: string[]) => parts.join("-");

/**
 * Token记录相关key
 * 格式: token-{userId}-{timestamp}
 *  * TODO:
 * 1. 需要增加按 cybotId 查询的支持: token-cybot-{cybotId}-{recordId}
 * 2. 需要增加全站统计支持: token-stats-day-site-{dateKey}
 */
export const createTokenKey = {
  // 创建单条记录key
  record: curry((userId: string, timestamp: number) => {
    const key = createKey("token", userId, timestamp.toString());
    logger.debug({ userId, timestamp, key }, "Created token record key");
    return key;
  }),

  // 创建查询范围
  range: (userId: string, timestamp: number) => {
    const start = createKey("token", userId, timestamp.toString());
    const end = createKey("token", userId, (timestamp + 86400000).toString());
    logger.debug({ userId, start, end }, "Created token range keys");
    return { start, end };
  },
};

/**
 * Token统计key - 保持原有格式
 * token-stats-day-user-{userId}-{dateKey}
 */
export const createTokenStatsKey = curry((userId: string, dateKey: string) => {
  const key = createKey("token", "stats", "day", "user", userId, dateKey);
  logger.debug({ userId, dateKey, key }, "Created token stats key");
  return key;
});

// 其他key保持不变
export const createDialogKey = (userId: string) =>
  createKey(DataType.DIALOG, userId, ulid());

export const createDialogMessageKey = (dialogId: string) =>
  createKey(DataType.DIALOG, dialogId, "msg", ulid());

export const createCybotKey = (userId: string) =>
  createKey(DataType.CYBOT, userId, ulid());
export const createPageKey = (userId: string) =>
  createKey(DataType.PAGE, userId, ulid());
