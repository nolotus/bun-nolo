import pino from "pino";
import { CYBOT_SERVERS } from "../requests";

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
  console.log("isOnline", isOnline);

  if (!isOnline) {
    console.warn("Network is offline. Returning an empty server list.");
    return [];
  }

  // 如果在线，则返回正常的服务器列表
  return Array.from(
    new Set([currentServer, CYBOT_SERVERS.ONE, CYBOT_SERVERS.RUN])
  );
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

// 规范化时间字段
export const normalizeTimeFields = (data: any): any => ({
  ...data,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  updated_at: undefined,
  created_at: undefined,
});
