// src/database/requests.ts
import { API_ENDPOINTS } from "./config";
import { toast } from "react-hot-toast";

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

// 更新请求
export const noloPatchRequest = async (
  server: string,
  id: string,
  updates: any,
  state: any,
  signal?: AbortSignal
) => {
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

    return true;
  } catch (error) {
    if (error.name === "AbortError") {
    } else {
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
    return true;
  } catch (error) {
    if (error.name === "AbortError") {
    } else {
    }
    return false;
  }
};
