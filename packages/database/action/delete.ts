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

const noloDeleteRequest = async (
  server: string,
  id: string,
  state: any,
  signal?: AbortSignal
) => {
  logger.info({ server, id }, "Starting delete request");

  try {
    const response = await noloRequest(
      server,
      {
        url: `${API_ENDPOINTS.DATABASE}/delete/${id}`,
        method: "DELETE",
      },
      state,
      signal
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    logger.info({ server, id }, "Delete request successful");
    return true;
  } catch (error) {
    if (error.name === "AbortError") {
      logger.warn({ server, id }, "Delete request timeout");
    } else {
      logger.error({ error, server, id }, "Failed to delete from server");
    }
    return false;
  }
};

const syncWithServers = (servers: string[], id: string, state: any) => {
  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, TIMEOUT);

    noloDeleteRequest(server, id, state, abortController.signal)
      .then((success) => {
        clearTimeout(timeoutId);
        if (!success) {
          toast.error(`Failed to delete from ${server}`);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
      });
  });
};

export const deleteAction = async (id: string, thunkApi) => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);

  logger.info({ id }, "Starting delete action");

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

    // 后台同步
    Promise.resolve().then(() => {
      syncWithServers(servers, id, state);
    });

    return { id };
  } catch (error) {
    logger.error({ error, id }, "Delete action failed");
    throw error;
  }
};
