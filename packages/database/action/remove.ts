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

// 检查本地数据是否存在
const checkLocalData = async (dbKey: string): Promise<any> => {
  const data = await browserDb.get(dbKey);
  if (!data) {
    logger.warn({ dbKey }, "Data not found locally");
  }
  return data;
};

// 执行本地删除
const deleteLocalData = async (dbKey: string): Promise<void> => {
  await browserDb.del(dbKey);
  logger.info({ dbKey }, "Data deleted locally");
};

// 获取同步服务器列表
const getSyncServers = (currentServer: string): string[] => {
  return Array.from(
    new Set([currentServer, CYBOT_SERVERS.ONE, CYBOT_SERVERS.RUN])
  );
};

// 执行远程删除（异步，不等待结果）
const deleteRemoteData = (
  servers: string[],
  dbKey: string,
  state: any
): void => {
  Promise.resolve()
    .then(() =>
      syncWithServers(
        servers,
        noloDeleteRequest,
        "Failed to delete from",
        dbKey,
        { type: "single" },
        state
      )
    )
    .catch((error) => {
      logger.error({ error, dbKey }, "Failed to sync delete with servers");
    });
};

// 主删除动作函数
export const removeAction = async (
  dbKey: string,
  thunkApi
): Promise<{ dbKey: string }> => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);

  try {
    // 1. 检查本地数据（串行）
    const existingData = await checkLocalData(dbKey);

    // 2. 获取同步服务器列表（串行）
    const servers = getSyncServers(currentServer);

    // 3. 如果本地有数据，删除本地数据（串行）
    if (existingData) {
      await deleteLocalData(dbKey);
    }

    // 4. 异步触发远程删除（并行，不等待结果）
    deleteRemoteData(servers, dbKey, state);

    // 5. 直接返回结果（不等待远程删除）
    return { dbKey };
  } catch (error) {
    logger.error({ error, dbKey }, "Delete action failed");
    throw error;
  }
};
