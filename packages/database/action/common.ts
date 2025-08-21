// 文件路径: database/actions/common.ts

import pino from "pino";
import { SERVERS } from "../requests";
import { API_ENDPOINTS } from "../config";

export const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

// 获取所有服务器列表并去重 (无需改动)
export const getAllServers = (currentServer: string): string[] => {
  const isOnline = navigator.onLine;
  if (!isOnline) {
    console.warn("Network is offline. Returning an empty server list.");
    return [];
  }
  return Array.from(new Set([currentServer, SERVERS.MAIN, SERVERS.US]));
};

// 从客户端数据库获取数据 (无需改动)
export const fetchFromClientDb = async (
  clientDb: any,
  dbKey: string
): Promise<any> => {
  if (!clientDb) {
    logger.error(
      { dbKey },
      "Client database is undefined in fetchFromClientDb"
    );
    return null;
  }
  try {
    return await clientDb.get(dbKey);
  } catch (err) {
    logger.error({ err, dbKey }, "Failed to get local data");
    return null;
  }
};

// ======================================================================
// 【核心改造】: fetchFromServer 函数
// ======================================================================
export const fetchFromServer = async (
  server: string,
  dbKey: string,
  token?: string,
  // 1. 【新增】添加一个可选的 AbortSignal 参数
  signal?: AbortSignal
): Promise<any> => {
  try {
    const res = await fetch(
      `${server}${API_ENDPOINTS.DATABASE}/read/${dbKey}`,
      {
        // 2. 【核心】将 signal 传递给 fetch 的 options 对象
        //    如果 signal 是 undefined，fetch 会忽略它，这是安全的
        signal,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (res.status === 200) {
      return await res.json();
    }
    return null;
  } catch (err: any) {
    // 3. 【重要】区分中止错误和其他错误
    //    当请求被中止时，fetch 会抛出一个名为 'AbortError' 的错误。
    //    我们必须重新抛出这个错误，这样 Promise.allSettled 和上层 thunk 才能知道请求是被中止的，而不是失败了。
    if (err.name === "AbortError") {
      // console.log(`Fetch aborted for ${dbKey} from ${server}`); // 用于调试
      throw err; // 重新抛出，让调用者知道中止了
    }

    // 对于其他类型的错误（如网络中断），我们保持原有的逻辑，返回 null
    // console.error(`Fetch error for ${dbKey} from ${server}:`, err); // 用于调试
    return null;
  }
};

// 规范化时间字段 (无需改动)
export const normalizeTimeFields = (data: any): any => ({
  ...data,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  updated_at: undefined,
  created_at: undefined,
});
