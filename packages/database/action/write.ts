import { selectCurrentUserId } from "auth/authSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { API_ENDPOINTS } from "database/config";

import { DataType } from "create/types";
import { browserDb } from "../browser/db";
import { toast } from "react-hot-toast";
import { noloRequest } from "../requests";
// 写入请求
export const noloWriteRequest = async (
  server: string,
  { userId, data, customKey },
  state: any,
  signal?: AbortSignal
) => {
  try {
    const response = await noloRequest(
      server,
      {
        url: `${API_ENDPOINTS.DATABASE}/write/`,
        method: "POST",
        body: JSON.stringify({ data, customKey, userId }),
      },
      state,
      signal
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    if (error.name === "AbortError") {
    } else {
    }
    return false;
  }
};
const CYBOT_SERVERS = {
  ONE: "https://cybot.one",
  RUN: "https://cybot.run",
};

const TIMEOUT = 5000;

const syncWithServers = (servers, writeConfig, state) => {
  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT);

    noloWriteRequest(server, writeConfig, state, abortController.signal)
      .then((success) => {
        clearTimeout(timeoutId);
        if (!success) toast.error(`Failed to save to ${server}`);
      })
      .catch(() => clearTimeout(timeoutId));
  });
};

const normalizeTimeFields = (data) => ({
  ...data,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  updated_at: undefined,
  created_at: undefined,
});

export const writeAction = async (writeConfig, thunkApi) => {
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

    await browserDb.put(customKey, willSaveData);

    const servers = Array.from(
      new Set([currentServer, CYBOT_SERVERS.ONE, CYBOT_SERVERS.RUN])
    );
    const serverWriteConfig = { ...writeConfig, data: willSaveData, userId };

    Promise.resolve().then(() =>
      syncWithServers(servers, serverWriteConfig, state)
    );

    return willSaveData;
  } catch (error) {
    throw error;
  }
};
