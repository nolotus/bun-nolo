//  database/action/common.ts
import pino from "pino";
import { SERVERS } from "../requests";
import { API_ENDPOINTS } from "../config";

export const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

// 获取所有服务器列表并去重
export const getAllServers = (currentServer: string): string[] => {
  // 检测网络连接状态
  const isOnline = navigator.onLine;
  // console.log("isOnline", isOnline);

  if (!isOnline) {
    console.warn("Network is offline. Returning an empty server list.");
    return [];
  }

  // 如果在线，则返回正常的服务器列表
  return Array.from(new Set([currentServer, SERVERS.MAIN, SERVERS.US]));
};

// 从客户端数据库获取数据
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

export const fetchFromServer = async (
  server: string,
  dbKey: string,
  token?: string
): Promise<any> => {
  try {
    const res = await fetch(
      `${server}${API_ENDPOINTS.DATABASE}/read/${dbKey}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (res.status === 200) {
      return await res.json();
    }
    return null; // 原日志已删除
  } catch (err) {
    return null; // 原日志已删除
  }
};

// 规范化时间字段
export const normalizeTimeFields = (data: any): any => ({
  ...data,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  updated_at: undefined,
  created_at: undefined,
});
