// 文件路径: src/database/actions/delete.ts

import type { AppThunkApi } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";

import { noloDeleteRequest } from "../requests";
import { getAllServers, fetchFromClientDb } from "./common";

// 在远程服务器上异步并行删除数据
const triggerParallelRemoteDeletion = (
  servers: string[],
  dbKey: string,
  state: any
): void => {
  const deletePromises = servers.map((server) =>
    noloDeleteRequest(server, dbKey, { type: "single" }, state)
  );
  Promise.allSettled(deletePromises);
};

export const removeAction = async (
  dbKey: string,
  thunkApi: AppThunkApi
): Promise<{ dbKey: string }> => {
  const { db: clientDb } = thunkApi.extra;

  if (!clientDb) {
    throw new Error("Client database is undefined in removeAction");
  }

  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);

  try {
    const localData = await fetchFromClientDb(clientDb, dbKey);
    const servers = getAllServers(currentServer);

    if (localData) {
      // 将 removeFromLocalDb 的逻辑内联到此处
      await clientDb.del(dbKey);
    }

    triggerParallelRemoteDeletion(servers, dbKey, state);

    return { dbKey };
  } catch (error) {
    throw error;
  }
};
