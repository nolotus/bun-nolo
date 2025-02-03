// src/database/requests.ts
import { API_ENDPOINTS } from "./config";
import pino from "pino";
import { toast } from "react-hot-toast";

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

export const CYBOT_SERVERS = {
  ONE: "https://cybot.one",
  RUN: "https://cybot.run",
};

export const TIMEOUT = 5000;

export const noloRequest = async (
  server: string,
  config: {
    url: string;
    method?: string;
    body?: string;
  },
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

// 通用的服务器同步函数
export const syncWithServers = <T>(
  servers: string[],
  requestFn: (server: string, ...args: any[]) => Promise<boolean>,
  errorMessage: string,
  ...requestArgs: any[]
) => {
  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, TIMEOUT);

    requestFn(server, ...requestArgs, abortController.signal)
      .then((success) => {
        clearTimeout(timeoutId);
        if (!success) {
          toast.error(`${errorMessage} ${server}`);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
      });
  });
};

// 写入请求
export const noloWriteRequest = async (
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

// 更新请求
export const noloPatchRequest = async (
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

// 删除请求
export const noloDeleteRequest = async (
  server: string,
  id: string,
  options: {
    type?: "messages" | "single";
  },
  state: any,
  signal?: AbortSignal
) => {
  const { type = "single" } = options;
  logger.info({ server, id, type }, "Starting delete request");

  try {
    const url =
      type === "messages"
        ? `${API_ENDPOINTS.DATABASE}/delete/${id}?type=messages`
        : `${API_ENDPOINTS.DATABASE}/delete/${id}`;

    const response = await noloRequest(
      server,
      {
        url,
        method: "DELETE",
      },
      state,
      signal
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    logger.info({ server, id, result }, "Delete request successful");
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
