import { browserDb } from "../browser/db";
import { API_ENDPOINTS } from "../config";
import { selectCurrentServer } from "setting/settingSlice";
import { toast } from "react-hot-toast";
import pino from "pino";

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

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

const noloPatchRequest = async (
  server: string,
  id: string,
  updates: any,
  state: any,
  signal?: AbortSignal
) => {
  logger.info({ server, id }, "Starting patch request");

  try {
    const response = await noloRequest(
      server,
      {
        url: `${API_ENDPOINTS.DATABASE}/patch/${id}`,
        method: "PATCH",
        body: JSON.stringify(updates),
      },
      state,
      signal
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    logger.info({ server, id }, "Patch request successful");
    return true;
  } catch (error) {
    if (error.name === "AbortError") {
      logger.warn({ server, id }, "Patch request timeout");
    } else {
      logger.error({ error, server, id }, "Failed to patch on server");
    }
    return false;
  }
};

const syncWithServers = (
  servers: string[],
  id: string,
  updates: any,
  state: any
) => {
  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, TIMEOUT);

    noloPatchRequest(server, id, updates, state, abortController.signal)
      .then((success) => {
        clearTimeout(timeoutId);
        if (!success) {
          toast.error(`Failed to update on ${server}`);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
      });
  });
};

export const patchAction = async ({ id, changes }, thunkApi) => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);

  logger.info({ id }, "Starting patch action");

  try {
    // 读取当前数据
    const currentData = await browserDb.get(id);
    if (!currentData) {
      logger.warn({ id }, "Data not found locally");
      throw new Error("Data not found");
    }

    // 准备更新数据
    const updatedChanges = {
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    const newData = {
      ...currentData,
      ...updatedChanges,
    };

    // 本地更新
    await browserDb.put(id, newData);
    logger.info({ id }, "Data updated locally");

    // 准备服务器列表
    const servers = Array.from(
      new Set([currentServer, CYBOT_SERVERS.ONE, CYBOT_SERVERS.RUN])
    );

    // 后台同步
    Promise.resolve().then(() => {
      syncWithServers(servers, id, updatedChanges, state);
    });

    return newData;
  } catch (error) {
    logger.error({ error, id }, "Patch action failed");
    throw error;
  }
};
