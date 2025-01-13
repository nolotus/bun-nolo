// api/messages.js
import { curry } from "rambda";
import { pino } from "pino";
import { browserDb } from "database/browser/db";
import { API_ENDPOINTS } from "database/config";
import { selectCurrentServer } from "setting/settingSlice";
import { createKey } from "database/keys";

const logger = pino({ name: "messages-api" });

// 创建dialog message前缀的工具函数
const createDialogPrefix = curry((dialogId) =>
  createKey("dialog", dialogId, "msg")
);

const noloRequest = async (state, config) => {
  const currentServer = selectCurrentServer(state);
  const dynamicUrl = currentServer + config.url;
  const method = config.method || "GET";
  const headers = {
    "Content-Type": "application/json",
  };

  if (state.auth) {
    headers.Authorization = `Bearer ${state.auth.currentToken}`;
  }

  return fetch(dynamicUrl, {
    method,
    headers,
    body: config.body,
  });
};

const batchDeleteKeys = async (db, keys) => {
  const batch = db.batch();
  keys.forEach((key) => batch.del(key));
  await batch.write();
  logger.debug({ count: keys.length }, "Batch deleted keys");
};

const collectKeysToDelete = async (db, prefix) => {
  const keys = [];
  for await (const [key] of db.iterator({
    gte: prefix,
    lte: prefix + "\uffff",
  })) {
    keys.push(key);
  }
  logger.debug({ prefix, count: keys.length }, "Collected keys to delete");
  return keys;
};

const remoteDelete = async (dialogId, getState) => {
  try {
    const res = await noloRequest(getState(), {
      url: `${API_ENDPOINTS.DATABASE}/delete/${dialogId}?type=messages`,
      method: "DELETE",
    });

    if (res.ok) {
      const result = await res.json();
      logger.info({ dialogId, result }, "Remote messages delete successful");
      return result;
    }
  } catch (err) {
    logger.error({ dialogId, err }, "Remote messages delete failed");
  }
};

export const deleteAllMessages = async (dialogId, thunkApi) => {
  const prefix = createDialogPrefix(dialogId);

  try {
    // 收集要删除的keys
    const deletedIds = await collectKeysToDelete(browserDb, prefix);
    if (!deletedIds.length) {
      logger.info({ dialogId }, "No messages to delete");
      return { ids: [] };
    }

    // 本地批量删除
    await batchDeleteKeys(browserDb, deletedIds);

    // 异步执行远程删除
    remoteDelete(dialogId, thunkApi.getState);

    return { ids: deletedIds };
  } catch (err) {
    logger.error({ dialogId, err }, "Failed to delete messages");
    throw err;
  }
};
