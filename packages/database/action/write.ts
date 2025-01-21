import { selectCurrentUserId } from "auth/authSlice";
import { API_ENDPOINTS } from "database/config";
import { selectCurrentServer } from "setting/settingSlice";
import { DataType } from "create/types";
import { browserDb } from "../browser/db";
import { toast } from "react-hot-toast";
import pino from "pino";

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});
// selectSyncServers
const CYBOT_SERVERS = {
  ONE: "https://cybot.one",
  RUN: "https://cybot.run",
};

const TIMEOUT = 5000;

const noloRequest = async (
  server: string,
  config,
  state: any,
  signal?: AbortSignal
) => {
  const headers = {
    "Content-Type": "application/json",
    ...(state.auth?.currentToken && {
      Authorization: `Bearer ${state.auth.currentToken}`,
    }),
  };

  return fetch(server + config.url, {
    method: config.method || "GET",
    headers,
    body: config.body,
    signal,
  });
};

const noloWriteRequest = async (
  server: string,
  { userId, data, customId },
  state: any,
  signal?: AbortSignal
) => {
  logger.info({ server, userId, customId }, "Starting write request");

  try {
    const response = await noloRequest(
      server,
      {
        url: `${API_ENDPOINTS.DATABASE}/write/`,
        method: "POST",
        body: JSON.stringify({ data, customId, userId }),
      },
      state,
      signal
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    logger.info({ server }, "Write request successful");
    return true;
  } catch (error) {
    if (error.name === "AbortError") {
      logger.warn({ server, customId }, "Write request timeout");
    } else {
      logger.error({ error, server }, "Failed to write to server");
    }
    return false;
  }
};

const syncWithServers = (servers: string[], writeConfig: any, state: any) => {
  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, TIMEOUT);

    noloWriteRequest(server, writeConfig, state, abortController.signal)
      .then((success) => {
        clearTimeout(timeoutId);
        if (!success) {
          toast.error(`Failed to save to ${server}`);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
      });
  });
};

const normalizeTimeFields = (data: Record<string, any>) => ({
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
  const { data, customId } = writeConfig;
  const userId = writeConfig.userId || currentUserId;

  logger.info({ dataType: data.type, customId }, "Starting write action");

  // 验证数据类型
  if (
    ![
      DataType.MSG,
      DataType.CYBOT,
      DataType.PAGE,
      DataType.DIALOG,
      DataType.TOKEN,
    ].includes(data.type)
  ) {
    logger.warn({ dataType: data.type }, "Unsupported data type");
    return null;
  }

  try {
    // 准备保存数据
    const willSaveData = normalizeTimeFields({
      ...data,
      id: customId,
      userId: currentUserId,
    });

    // 本地存储
    await browserDb.put(customId, willSaveData);
    logger.info({ customId }, "Data saved locally");

    // 获取去重后的服务器列表
    const servers = Array.from(
      new Set([currentServer, CYBOT_SERVERS.ONE, CYBOT_SERVERS.RUN])
    );
    const serverWriteConfig = {
      ...writeConfig,
      data: willSaveData,
      userId,
    };

    // 后台同步
    Promise.resolve().then(() => {
      syncWithServers(servers, serverWriteConfig, state);
    });

    return willSaveData;
  } catch (error) {
    logger.error({ error }, "Write action failed");
    throw error;
  }
};
