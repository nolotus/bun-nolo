// src/database/actions/delete.ts
import { browserDb } from "../browser/db";
import { selectCurrentServer } from "setting/settingSlice";
import pino from "pino";

import { noloDeleteRequest, syncWithServers, CYBOT_SERVERS } from "../requests";
const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

// 删除单条数据
export const deleteAction = async (id: string, thunkApi) => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);

  try {
    const existingData = await browserDb.get(id);
    if (!existingData) {
      logger.warn({ id }, "Data not found locally");
      return { id };
    }

    await browserDb.del(id);
    logger.info({ id }, "Data deleted locally");

    const servers = Array.from(
      new Set([currentServer, CYBOT_SERVERS.ONE, CYBOT_SERVERS.RUN])
    );

    Promise.resolve().then(() => {
      syncWithServers(
        servers,
        noloDeleteRequest,
        "Failed to delete from",
        id,
        { type: "single" },
        state
      );
    });

    return { id };
  } catch (error) {
    logger.error({ error, id }, "Delete action failed");
    throw error;
  }
};
