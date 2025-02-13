import { ulid } from "ulid";
import { curry } from "rambda";
import { DataType } from "create/types";

// 基础key创建保持不变
export const createKey = (...parts: string[]) => parts.join("-");
// 用户key
export const DB_PREFIX = {
  USER: "user:",
} as const;

/**
 * 交易记录相关key
 * 格式:
 * - 交易记录: tx-{userId}-{txId}
 * - 交易ID索引: tx-index-{txId}
 */
export const createTransactionKey = {
  // 创建交易记录key
  record: curry((userId: string, txId: string) => {
    const key = createKey("tx", userId, txId);
    return key;
  }),

  // 创建交易ID索引key
  index: (txId: string) => {
    const key = createKey("tx", "index", txId);
    return key;
  },

  // 获取用户交易记录范围
  range: (userId: string) => {
    const start = createKey("tx", userId, "");
    const end = createKey("tx", userId, "\uffff");
    return { start, end };
  },
};

/**
 * Token记录相关key
 * 格式: token-{userId}-{timestamp}
 */
export const createTokenKey = {
  // 创建单条记录key
  record: curry((userId: string, timestamp: number) => {
    const key = createKey("token", userId, timestamp.toString());
    return key;
  }),

  // 创建查询范围
  range: (userId: string, timestamp: number) => {
    const start = createKey("token", userId, timestamp.toString());
    const end = createKey("token", userId, (timestamp + 86400000).toString());
    return { start, end };
  },
};

/**
 * Token统计key
 * token-stats-day-user-{userId}-{dateKey}
 */
export const createTokenStatsKey = curry((userId: string, dateKey: string) => {
  const key = createKey("token", "stats", "day", "user", userId, dateKey);
  return key;
});

export const createDialogKey = (userId: string) =>
  createKey(DataType.DIALOG, userId, ulid());

export const createDialogMessageKey = (dialogId: string) =>
  createKey(DataType.DIALOG, dialogId, "msg", ulid());

export const createPageKey = (userId: string) =>
  createKey(DataType.PAGE, userId, ulid());

export const createCybotKey = {
  // 创建私有版本key
  private: curry((userId: string, cybotId: string) => {
    const key = createKey(DataType.CYBOT, userId, cybotId);
    return key;
  }),

  // 创建公开版本key
  public: (cybotId: string) => {
    const key = createKey(DataType.CYBOT, "pub", cybotId);
    return key;
  },
};

export const pubCybotKeys = {
  // 获取单个公开cybot
  single: (cybotId: string) => {
    const key = createKey(DataType.CYBOT, "pub", cybotId);
    return key;
  },

  // 获取公开cybot列表范围
  list: () => {
    const start = createKey(DataType.CYBOT, "pub", "");
    const end = createKey(DataType.CYBOT, "pub", "\uffff");
    return { start, end };
  },
};

/**
 * Space相关key
 * - space主文档: space-{spaceId}
 * - 成员索引: space-member-{userId}-{spaceId}
 */
export const createSpaceKey = {
  space: (spaceId: string) => {
    return createKey(DataType.SPACE, spaceId);
  },

  member: curry((userId: string, spaceId: string) => {
    return createKey(DataType.SPACE, "member", userId, spaceId);
  }),

  // 获取用户参与的space范围
  memberRange: (userId: string) => {
    const start = createKey(DataType.SPACE, "member", userId, "");
    const end = createKey(DataType.SPACE, "member", userId, "\uffff");
    return { start, end };
  },
};
