import { selectCurrentServer } from "app/settings/settingSlice";
import { noloDeleteRequest, syncWithServers, SERVERS } from "database/requests";
import { createKey } from "database/keys";

import { resetMsgs } from "../messageSlice";

// 通用的 key 收集
const collectKeys = async (prefix, db) => {
  const keys = [];
  for await (const [key] of db.iterator({
    gte: prefix,
    lte: prefix + "\uffff",
  })) {
    keys.push(key);
  }
  return keys;
};

// 删除对话消息
export const deleteDialogMsgsAction = async (dialogId, thunkApi) => {
  const prefix = createKey("dialog", dialogId, "msg");
  const state = thunkApi.getState();
  const { db } = thunkApi.extra;
  const currentServer = selectCurrentServer(state);

  try {
    const deletedIds = await collectKeys(prefix, db);
    if (!deletedIds.length) return { ids: [] };

    // 使用数组批量操作
    const ops = deletedIds.map((key) => ({ type: "del" as const, key }));
    await db.batch(ops);

    const servers = Array.from(
      new Set([currentServer, SERVERS.MAIN, SERVERS.US])
    );
    // 异步同步到服务器（非阻塞）
    void syncWithServers(
      servers,
      noloDeleteRequest,
      "Failed to delete messages from",
      dialogId,
      { type: "messages" },
      state
    );

    await thunkApi.dispatch(resetMsgs());
    return { ids: deletedIds };
  } catch (error) {
    throw error;
  }
};
