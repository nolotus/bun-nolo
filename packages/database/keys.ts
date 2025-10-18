/* ===========================================================================
 *  keys.ts —— 统一的 Key 辅助函数集合
 *  1) 通用存储键（row / idx / dir / meta）
 *  2) 现有业务键（user / tx / token / dialog / page / cybot …）
 * =========================================================================*/

import { ulid } from "ulid";
import { curry } from "rambda";
import { DataType } from "create/types"; // 枚举：DIALOG / PAGE / CYBOT …

/* --------------------------------------------------------------------------
 * 基础工具
 * ------------------------------------------------------------------------*/
export const createKey = (...parts: (string | number)[]) => parts.join("-");

/* --------------------------------------------------------------------------
 * 1. 通用存储键 —— 行 / 索引 / 目录 / 元数据
 * ------------------------------------------------------------------------*/

/**
 * 行主键
 * {tableId}-{tenantId}-{rowId}
 */
export const rowKey = {
  /* 生成新行主键 + rowId */
  create: (tenantId: string, tableId: string) => {
    const rowId = ulid();
    return { dbKey: createKey(tableId, tenantId, rowId), rowId };
  },

  /* 单行键 */
  single: (tenantId: string, tableId: string, rowId: string) =>
    createKey(tableId, tenantId, rowId),

  /* 整张表的范围（gte / lte）—— 供批量操作使用 */
  range: (tenantId: string, tableId: string) => ({
    gte: createKey(tableId, tenantId, ""),
    lte: createKey(tableId, tenantId, "\uffff"),
  }),

  /* 旧接口（start / end）—— 与早期代码兼容 */
  rangeOfTable: (tenantId: string, tableId: string) => ({
    start: createKey(tableId, tenantId, ""),
    end: createKey(tableId, tenantId, "\uffff"),
  }),
};

/**
 * 二级索引键
 * idx-{tableId}-{tenantId}-{indexName}-{indexKey}-{rowId}
 */
export const idxKey = {
  /* 写入单条索引 */
  put: (
    tenantId: string,
    tableId: string,
    indexName: string,
    indexKey: string,
    rowId: string
  ) => createKey("idx", tableId, tenantId, indexName, indexKey, rowId),

  /* 某一索引名前缀的范围（start / end）—— 供前缀扫描 */
  range: (
    tenantId: string,
    tableId: string,
    indexName: string,
    indexKeyPrefix = ""
  ) => {
    const start = createKey(
      "idx",
      tableId,
      tenantId,
      indexName,
      indexKeyPrefix
    );
    return { start, end: start + "\uffff" };
  },

  /* 整张表所有索引的范围（gte / lte）—— 供整表删除 */
  prefix: (tenantId: string, tableId: string) => ({
    gte: createKey("idx", tableId, tenantId, ""),
    lte: createKey("idx", tableId, tenantId, "\uffff"),
  }),
};

/**
 * 元数据键
 * meta-{tenantId}-{tableId}
 */
export const metaKey = (tenantId: string, tableId: string) =>
  createKey("meta", tenantId, tableId);

/* --------------------------------------------------------------------------
 * 2. 业务侧原有键（保持完全兼容）
 * ------------------------------------------------------------------------*/

export const DB_PREFIX = {
  USER: "user:",
} as const;

/* ---- User ---- */
export const createUserKey = {
  settings: (userId: string) => createKey(userId, "settings"),
  profile: (userId: string) => createKey(userId, "profile"),
};

/* ---- Transaction ---- */
export const createTransactionKey = {
  record: curry((userId: string, txId: string) =>
    createKey("tx", userId, txId)
  ),
  index: (txId: string) => createKey("tx", "index", txId),
  range: (userId: string) => ({
    start: createKey("tx", userId, ""),
    end: createKey("tx", userId, "\uffff"),
  }),
};

/* ---- Token ---- */
export const createTokenKey = {
  record: curry((userId: string, timestamp: number) =>
    createKey("token", userId, timestamp.toString())
  ),
  range: (userId: string, timestamp: number) => ({
    start: createKey("token", userId, timestamp.toString()),
    end: createKey("token", userId, (timestamp + 86_400_000).toString()),
  }),
};

/* ---- Token Stats ---- */
export const createTokenStatsKey = curry((userId: string, dateKey: string) =>
  createKey("token", "stats", "day", "user", userId, dateKey)
);

/* ---- Dialog ---- */
export const createDialogKey = (userId: string) =>
  createKey(DataType.DIALOG, userId, ulid());

export const createDialogMessageKeyAndId = (
  dialogId: string
): { key: string; messageId: string } => {
  const messageId = ulid();
  const key = createKey(DataType.DIALOG, dialogId, "msg", messageId);
  return { key, messageId };
};

/* ---- Page ---- */
export const createPageKey = {
  create: (userId: string) => {
    const id = ulid();
    return { dbKey: createKey(DataType.PAGE, userId, id), id };
  },
};

export const createCybotKey = {
  private: curry((userId: string, cybotId: string) =>
    createKey(DataType.CYBOT, userId, cybotId)
  ),
  public: (cybotId: string) => createKey(DataType.CYBOT, "pub", cybotId),
};

export const pubAgentKeys = {
  single: (cybotId: string) => createKey(DataType.CYBOT, "pub", cybotId),
  list: () => ({
    start: createKey(DataType.CYBOT, "pub", ""),
    end: createKey(DataType.CYBOT, "pub", "\uffff"),
  }),
};
