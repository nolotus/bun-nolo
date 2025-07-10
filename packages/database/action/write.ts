// 文件路径: database/actions/write.ts

// 1. 【新增】从 store 导入 AppThunkApi 类型
import type { AppThunkApi } from "app/store";
import { selectUserId } from "auth/authSlice";
import { selectCurrentServer } from "app/settings/settingSlice";
import { DataType } from "create/types";
import { getAllServers, normalizeTimeFields, logger } from "./common";
import { noloWriteRequest, syncWithServers } from "../requests";

import { toast } from "react-hot-toast";

// 辅助函数：saveToClientDb (这个函数设计得很好，无需修改)
const saveToClientDb = async (
  clientDb: any,
  dbKey: string,
  data: any
): Promise<void> => {
  if (!clientDb) {
    logger.error({ dbKey }, "Client database is undefined in saveToClientDb");
    throw new Error("Client database instance is required");
  }
  try {
    await clientDb.put(dbKey, data);
    logger.debug({ dbKey }, "Data saved successfully to local database.");
  } catch (err: any) {
    logger.error({ err, dbKey }, "Failed to save data to local database");
    throw new Error(`Local database put failed for ${dbKey}: ${err.message}`);
  }
};

/**
 * Write Action: 写入新数据项。
 * 1. 验证数据类型。
 * 2. 规范化数据（添加时间戳、dbKey、userId）。
 * 3. 保存数据到本地数据库。
 * 4. 异步将完整数据写入服务器。
 * @param {object} writeConfig - 写入配置，包含 data, customKey, 可选 userId。
 * @param {AppThunkApi} thunkApi - Redux Thunk API。
 * @returns {Promise<any>} 已保存到本地的完整数据对象。
 * @throws {Error} 如果数据类型无效、本地保存失败。
 */
// 2. 【修改函数签名】移除第三个参数 clientDb，并将 thunkApi 类型设为 AppThunkApi
export const writeAction = async (
  writeConfig: { data: any; customKey: string; userId?: string },
  thunkApi: AppThunkApi
): Promise<any> => {
  // 3. 【核心改动】从 thunkApi.extra 中获取数据库实例 (使用你指正的正确 key 'db')
  const { db: clientDb } = thunkApi.extra;

  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);
  const currentUserId = selectUserId(state);
  const { data, customKey } = writeConfig;
  const userId = writeConfig.userId || currentUserId;

  if (!data || !customKey) {
    const errorMsg =
      "Invalid arguments for writeAction: data and customKey are required.";
    logger.error(errorMsg, { writeConfig });
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  // ... 数据类型验证逻辑保持不变 ...
  const VALID_TYPES = [
    DataType.MSG,
    DataType.CYBOT,
    DataType.PAGE,
    DataType.DIALOG,
    DataType.TOKEN,
    DataType.TRANSACTION,
    DataType.SPACE,
    DataType.SETTING,
  ];
  if (!data.type || !VALID_TYPES.includes(data.type)) {
    logger.warn(
      `Invalid data type "${data.type}" for writeAction with key ${customKey}. Proceeding anyway.`
    );
  }

  try {
    const willSaveData = normalizeTimeFields({
      ...data,
      dbKey: customKey,
      userId: userId,
    });

    // 本地保存，使用的是从 thunkApi 中获取的 clientDb
    await saveToClientDb(clientDb, customKey, willSaveData);

    const servers = getAllServers(currentServer);

    const serverWriteConfig = {
      data: willSaveData,
      customKey: customKey,
      userId: userId,
    };

    // 后台同步逻辑保持不变
    Promise.resolve().then(() => {
      logger.debug(
        `[writeAction] Initiating background sync for key: ${customKey} to ${servers.length} servers.`
      );
      syncWithServers(
        servers,
        noloWriteRequest,
        `Write sync failed for ${customKey} on`,
        serverWriteConfig,
        state
      );
    });

    return willSaveData;
  } catch (error: any) {
    const errorMessage = `Write action failed for ${customKey}: ${error.message || "Unknown error"}`;
    logger.error("[writeAction] Error:", error);
    toast.error(`Failed to save data for ${customKey}.`);
    throw error;
  }
};
