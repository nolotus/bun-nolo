// src/database/actions/write.ts
import { selectCurrentUserId } from "auth/authSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { API_ENDPOINTS } from "database/config";
import { DataType } from "create/types";
import { browserDb } from "../browser/db";
import { getAllServers, normalizeTimeFields, logger } from "./common";

const TIMEOUT = 5000;

// 保存数据到客户端数据库
const saveToClientDb = async (
  clientDb: any,
  dbKey: string,
  data: any
): Promise<void> => {
  if (!clientDb) {
    logger.error({ dbKey }, "Client database is undefined in saveToClientDb");
    throw new Error("Client database is undefined");
  }
  try {
    await clientDb.put(dbKey, data);
  } catch (err) {
    logger.error({ err, dbKey }, "Failed to save data to local database");
    throw err;
  }
};

// 异步并行写入服务器
const syncWithServers = (
  servers: string[],
  writeConfig: any,
  state: any
): void => {
  const { userId, data, customKey } = writeConfig;

  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT);

    const headers = {
      "Content-Type": "application/json",
      ...(state.auth?.currentToken && {
        Authorization: `Bearer ${state.auth.currentToken}`,
      }),
    };

    fetch(`${server}${API_ENDPOINTS.DATABASE}/write/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ data, customKey, userId }),
      signal: abortController.signal,
    })
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          // toast.error(`Failed to save to ${server}`);
        }
      })
      .catch(() => clearTimeout(timeoutId));
  });
};

// 主写入动作函数
export const writeAction = async (
  writeConfig: any,
  thunkApi: any,
  clientDb: any = browserDb
): Promise<any> => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);
  const currentUserId = selectCurrentUserId(state);
  const { data, customKey } = writeConfig;
  const userId = writeConfig.userId || currentUserId;

  if (
    ![
      DataType.MSG,
      DataType.CYBOT,
      DataType.PAGE,
      DataType.DIALOG,
      DataType.TOKEN,
      DataType.TRANSACTION,
      DataType.SPACE,
      DataType.SETTING,
    ].includes(data.type)
  ) {
    throw new Error("无效的数据类型");
  }

  try {
    const willSaveData = normalizeTimeFields({
      ...data,
      dbKey: customKey,
      userId: currentUserId,
    });

    await saveToClientDb(clientDb, customKey, willSaveData);

    const servers = getAllServers(currentServer);
    const serverWriteConfig = { ...writeConfig, data: willSaveData, userId };

    Promise.resolve().then(() =>
      syncWithServers(servers, serverWriteConfig, state)
    );

    return willSaveData;
  } catch (error) {
    throw error;
  }
};
