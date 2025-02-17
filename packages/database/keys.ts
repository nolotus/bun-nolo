import { ulid } from "ulid";
import { curry } from "rambda";
import { DataType } from "create/types";

export const DB_PREFIX = {
  USER: "user:",
} as const;

// 基础key创建
export const createKey = (...parts: string[]) => parts.join("-");

/**
 * 用户相关数据key (采用userId前缀)
 */
export const createUserKey = {
  // 用户设置 {userId}-settings
  settings: (userId: string) => createKey(userId, "settings"),

  // 用户档案 {userId}-profile
  profile: (userId: string) => createKey(userId, "profile"),
};

/**
 * 交易记录相关key
 * - 交易记录: tx-{userId}-{txId}
 * - 交易ID索引: tx-index-{txId}
 */
export const createTransactionKey = {
  record: curry((userId: string, txId: string) => {
    const key = createKey("tx", userId, txId);
    return key;
  }),

  index: (txId: string) => {
    const key = createKey("tx", "index", txId);
    return key;
  },

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
  record: curry((userId: string, timestamp: number) => {
    const key = createKey("token", userId, timestamp.toString());
    return key;
  }),

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

/**
 * Dialog相关key (采用type前缀)
 * - dialog-{userId}-{dialogId}
 * - dialog-{dialogId}-msg-{messageId}
 */
export const createDialogKey = (userId: string) =>
  createKey(DataType.DIALOG, userId, ulid());

export const createDialogMessageKey = (dialogId: string) =>
  createKey(DataType.DIALOG, dialogId, "msg", ulid());

/**
 * Page相关key
 * page-{userId}-{pageId}
 */
export const createPageKey = {
  create: (userId: string) => {
    const id = ulid();
    return {
      dbKey: createKey(DataType.PAGE, userId, id),
      id,
    };
  },
};
/**
 * Cybot相关key
 */
export const createCybotKey = {
  private: curry((userId: string, cybotId: string) => {
    const key = createKey(DataType.CYBOT, userId, cybotId);
    return key;
  }),

  public: (cybotId: string) => {
    const key = createKey(DataType.CYBOT, "pub", cybotId);
    return key;
  },
};

export const pubCybotKeys = {
  single: (cybotId: string) => {
    const key = createKey(DataType.CYBOT, "pub", cybotId);
    return key;
  },

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

  memberRange: (userId: string) => {
    const start = createKey(DataType.SPACE, "member", userId, "");
    const end = createKey(DataType.SPACE, "member", userId, "\uffff");
    return { start, end };
  },

  spaceFromMember: (memberKey: string) => {
    const parts = memberKey.split("-");
    const spaceId = parts[parts.length - 1]; // 获取最后一部分作为spaceId
    return createKey(DataType.SPACE, spaceId);
  },
  spaceIdFromMember: (memberKey: string) => {
    const parts = memberKey.split("-");
    return parts[parts.length - 1]; // 获取最后一部分作为spaceId
  },
};
