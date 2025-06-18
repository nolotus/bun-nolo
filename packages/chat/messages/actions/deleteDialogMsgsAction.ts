// chat/message/action/
import { selectCurrentServer } from "setting/settingSlice";
import { noloDeleteRequest, syncWithServers, SERVERS } from "database/requests";
import pino from "pino";
import { browserDb } from "database/browser/db";
import { createKey } from "database/keys";
import { resetMsgs } from "../messageSlice";

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});
// 通用的本地批量删除
const batchDeleteLocal = async (keys: string[]) => {
  const batch = browserDb.batch();
  keys.forEach((key) => batch.del(key));
  await batch.write();
  logger.debug({ count: keys.length }, "Batch deleted keys locally");
};

// 通用的key收集
const collectKeys = async (prefix: string) => {
  const keys = [];
  for await (const [key] of browserDb.iterator({
    gte: prefix,
    lte: prefix + "\uffff",
  })) {
    keys.push(key);
  }
  return keys;
};

// 删除对话消息
export const deleteDialogMsgsAction = async (dialogId: string, thunkApi) => {
  const prefix = createKey("dialog", dialogId, "msg");
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);

  try {
    const deletedIds = await collectKeys(prefix);
    if (!deletedIds.length) {
      logger.info({ dialogId }, "No messages to delete");
      return { ids: [] };
    }

    await batchDeleteLocal(deletedIds);

    const servers = Array.from(
      new Set([currentServer, SERVERS.MAIN, SERVERS.US])
    );

    Promise.resolve().then(() => {
      syncWithServers(
        servers,
        noloDeleteRequest,
        "Failed to delete messages from",
        dialogId,
        { type: "messages" },
        state
      );
    });
    await thunkApi.dispatch(resetMsgs());
    return { ids: deletedIds };
  } catch (error) {
    logger.error({ dialogId, error }, "Failed to delete messages");
    throw error;
  }
};
