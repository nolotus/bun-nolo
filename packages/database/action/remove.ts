// src/database/actions/delete.ts
import { browserDb } from "../browser/db";
import { selectCurrentServer } from "app/settings/settingSlice";
import pino from "pino";
import { noloDeleteRequest } from "../requests";
import { getAllServers, fetchFromClientDb } from "./common";

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

// 从本地数据库删除数据
const removeFromLocalDb = async (
  clientDb: any,
  dbKey: string
): Promise<void> => {
  if (!clientDb) {
    logger.error(
      { dbKey },
      "Client database is undefined in removeFromLocalDb"
    );
    return;
  }
  try {
    await clientDb.del(dbKey);
  } catch (err) {
    logger.error({ err, dbKey }, "Failed to delete local data");
  }
};

// 在远程服务器上异步并行删除数据
const triggerParallelRemoteDeletion = (
  servers: string[],
  dbKey: string,
  state: any
): void => {
  const deletePromises = servers.map((server) =>
    noloDeleteRequest(server, dbKey, { type: "single" }, state).catch((err) => {
      logger.error({ err, server, dbKey }, "Failed to delete from server");
    })
  );
  Promise.allSettled(deletePromises); // 异步执行，不等待
};

// 主删除动作函数
export const removeAction = async (
  dbKey: string,
  thunkApi: any,
  clientDb: any = browserDb
): Promise<{ dbKey: string }> => {
  if (!clientDb) {
    const errorMsg = "Client database is undefined in removeAction";
    logger.error({ dbKey }, errorMsg);
    throw new Error(errorMsg);
  }

  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);

  try {
    // 1. 检查并获取本地数据
    const localData = await fetchFromClientDb(clientDb, dbKey);

    // 2. 获取所有服务器列表（去重）
    const servers = getAllServers(currentServer);

    // 3. 如果本地数据存在，则删除
    if (localData) {
      await removeFromLocalDb(clientDb, dbKey);
    }

    // 4. 触发远程服务器并行删除（异步，不等待）
    triggerParallelRemoteDeletion(servers, dbKey, state);

    // 5. 返回删除结果
    return { dbKey };
  } catch (error) {
    logger.error({ error, dbKey }, "Delete action failed");
    throw error;
  }
};
