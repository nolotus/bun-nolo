// database/requests.ts
import { API_ENDPOINTS } from "./config";
import { toast } from "react-hot-toast";

export const CYBOT_SERVERS = {
  ONE: "https://cybot.one",
  RUN: "https://cybot.run",
};

export const TIMEOUT = 5000;

/**
 * 通用的Nolo服务器请求函数
 * @param server 服务器地址
 * @param config 请求配置 (url, method, body)
 * @param state Redux state (用于获取token)
 * @param signal AbortSignal 用于取消请求
 * @returns Fetch Response Promise
 */
export const noloRequest = async (
  server: string,
  config: {
    url: string;
    method?: string;
    body?: string;
  },
  state: any,
  signal?: AbortSignal
): Promise<Response> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  // 从 state 中安全地获取 token
  const token = state?.auth?.currentToken;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(server + config.url, {
    method: config.method || "GET",
    headers,
    body: config.body,
    signal, // 传递 AbortSignal
  });
};

/**
 * 向单个服务器发送 PATCH 请求 (用于更新部分数据)
 * @param server 服务器地址
 * @param dbKey 数据键
 * @param updates 要更新的数据对象
 * @param state Redux state
 * @param signal AbortSignal
 * @returns Promise<boolean> 请求是否成功 (response.ok)
 */
export const noloPatchRequest = async (
  server: string,
  dbKey: string,
  updates: any,
  state: any,
  signal?: AbortSignal
): Promise<boolean> => {
  try {
    const response = await noloRequest(
      server,
      {
        url: `${API_ENDPOINTS.DATABASE}/patch/${dbKey}`,
        method: "PATCH",
        body: JSON.stringify(updates),
      },
      state,
      signal
    );
    if (!response.ok) {
      console.error(
        `PATCH request failed for ${dbKey} on ${server}: HTTP ${response.status}`
      );
    }
    return response.ok;
  } catch (error: any) {
    if (error.name !== "AbortError") {
      console.error(
        `PATCH request failed for ${dbKey} on ${server}: ${error.message || "Unknown error"}`
      );
    }
    // 对于 AbortError 或其他网络错误，返回 false
    return false;
  }
};

/**
 * 向单个服务器发送 POST 请求 (用于写入完整数据)
 * @param server 服务器地址
 * @param writeConfig 写入配置 { data, customKey, userId }
 * @param state Redux state
 * @param signal AbortSignal
 * @returns Promise<boolean> 请求是否成功 (response.ok)
 */
export const noloWriteRequest = async (
  server: string,
  writeConfig: { data: any; customKey: string; userId?: string },
  state: any,
  signal?: AbortSignal
): Promise<boolean> => {
  const { data, customKey, userId } = writeConfig;
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
      console.error(
        `Write request failed for ${customKey} on ${server}: HTTP ${response.status}`
      );
    }
    return response.ok;
  } catch (error: any) {
    if (error.name !== "AbortError") {
      console.error(
        `Write request failed for ${customKey} on ${server}: ${error.message || "Unknown error"}`
      );
    }
    // 对于 AbortError 或其他网络错误，返回 false
    return false;
  }
};

/**
 * 通用的服务器同步函数，带有超时和错误处理
 * @param servers 服务器地址列表
 * @param requestFn 实际执行请求的函数 (应返回 Promise<boolean>)
 * @param errorMessage 失败时的错误消息前缀
 * @param requestArgs 传递给 requestFn 的额外参数 (除了 server 和 signal)
 */
export const syncWithServers = <TArgs extends any[]>(
  servers: string[],
  requestFn: (
    server: string,
    ...args: [...TArgs, AbortSignal?]
  ) => Promise<boolean>,
  errorMessage: string,
  ...requestArgs: TArgs
): void => {
  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      // console.warn(`Request to ${server} timed out after ${TIMEOUT}ms`); // 可选：超时警告
      abortController.abort(); // 超时时中止请求
    }, TIMEOUT);

    // 执行请求函数
    requestFn(server, ...requestArgs, abortController.signal)
      .then((success) => {
        clearTimeout(timeoutId); // 清除超时定时器
        if (!success) {
          // 只在请求明确失败时提示（非超时）
          // 注意：noloPatchRequest/noloWriteRequest 内部已打印详细错误
          // 此处 toast 可考虑移除或改为更通用的后台同步失败提示
          // toast.error(`${errorMessage} ${server}`);
          console.warn(`${errorMessage} ${server}`); // 使用 console.warn 代替 toast
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId); // 清除超时定时器
        // AbortError 通常由超时引起，已在 requestFn 中处理或此处忽略
        if (error.name !== "AbortError") {
          console.error(
            `Unexpected error during sync with ${server}: ${error.message || "Unknown error"}`
          );
          // toast.error(`Sync failed with ${server}`); // 可选的通用失败提示
        }
      });
  });
};

/**
 * 向单个服务器发送 DELETE 请求
 * @param server 服务器地址
 * @param dbKey 数据键
 * @param options 可选参数 { type: 'messages' | 'single' }
 * @param state Redux state
 * @param signal AbortSignal
 * @returns Promise<boolean> 请求是否成功
 */
export const noloDeleteRequest = async (
  server: string,
  dbKey: string,
  options: {
    type?: "messages" | "single";
  },
  state: any,
  signal?: AbortSignal
): Promise<boolean> => {
  const { type = "single" } = options; // 默认为 'single'

  try {
    // 根据类型构建 URL
    const url =
      type === "messages"
        ? `${API_ENDPOINTS.DATABASE}/delete/${dbKey}?type=messages`
        : `${API_ENDPOINTS.DATABASE}/delete/${dbKey}`;

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
      console.error(
        `DELETE request failed for ${dbKey} on ${server}: HTTP ${response.status}`
      );
      // 可以选择抛出错误或返回false，这里返回false与syncWithServers兼容
      // throw new Error(`HTTP error! status: ${response.status}`);
      return false;
    }

    // 可选：如果需要处理响应体
    // const result = await response.json();
    // console.log(`DELETE successful for ${dbKey} on ${server}`, result);

    return true; // 请求成功
  } catch (error: any) {
    if (error.name !== "AbortError") {
      console.error(
        `DELETE request failed for ${dbKey} on ${server}: ${error.message || "Unknown error"}`
      );
    }
    // 对于 AbortError 或其他网络错误，返回 false
    return false;
  }
};
