// database/actions/write.ts
import { selectUserId } from "auth/authSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { DataType } from "create/types"; // 假设 DataType 是有效的导入
import { getAllServers, normalizeTimeFields, logger } from "./common";
import {
  noloWriteRequest, // 导入 write 请求函数
  syncWithServers, // 导入通用同步函数
} from "../requests";

//web
import { browserDb } from "../browser/db";
import { toast } from "react-hot-toast"; // 保留 toast 用于可能的顶层错误处理

// 辅助函数：保存数据到客户端数据库
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
    // 抛出错误，让 writeAction 捕获
    throw new Error(`Local database put failed for ${dbKey}: ${err.message}`);
  }
};

// 本地 syncWithServers 函数（使用 fetch 的版本）已被移除
// 现在使用从 ../requests 导入的 syncWithServers

/**
 * Write Action: 写入新数据项。
 * 1. 验证数据类型。
 * 2. 规范化数据（添加时间戳、dbKey、userId）。
 * 3. 保存数据到本地数据库。
 * 4. 异步将完整数据写入服务器。
 * @param {object} writeConfig - 写入配置，包含 data, customKey, 可选 userId。
 * @param {any} thunkApi - Redux Thunk API。
 * @param {any} clientDb - 客户端数据库实例 (默认为 browserDb)。
 * @returns {Promise<any>} 已保存到本地的完整数据对象。
 * @throws {Error} 如果数据类型无效、本地保存失败。
 */
export const writeAction = async (
  writeConfig: { data: any; customKey: string; userId?: string },
  thunkApi: any,
  clientDb: any = browserDb // 允许注入 DB 进行测试
): Promise<any> => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state); // 当前选定服务器
  const currentUserId = selectUserId(state); // 当前登录用户 ID
  const { data, customKey } = writeConfig;
  // 优先使用 writeConfig 中提供的 userId，否则回退到当前登录用户的 ID
  const userId = writeConfig.userId || currentUserId;

  if (!data || !customKey) {
    const errorMsg =
      "Invalid arguments for writeAction: data and customKey are required.";
    logger.error(errorMsg, { writeConfig });
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 1. 数据类型验证 (如果需要)
  // 假设 DataType 是一个枚举或包含有效类型的对象/数组
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
    // 根据严格程度，可以是警告或错误
    logger.warn(
      `Invalid data type "${data.type}" for writeAction with key ${customKey}. Proceeding anyway.`
    );
    // throw new Error(`Invalid data type: ${data.type}`); // 如果需要严格验证，取消注释此行
  }

  try {
    // 2. 准备要保存的数据 (添加时间戳、dbKey、userId)
    const willSaveData = normalizeTimeFields({
      // 添加 createdAt, updatedAt
      ...data,
      dbKey: customKey, // 确保 dbKey 存在于对象中
      userId: userId, // 确保 userId 存在于对象中
    });

    // 3. 首先尝试保存到本地数据库
    await saveToClientDb(clientDb, customKey, willSaveData);

    // 4. 获取所有目标服务器列表
    const servers = getAllServers(currentServer); // common.ts 中的函数，应处理去重

    // 5. 准备用于服务器写入的配置
    const serverWriteConfig = {
      data: willSaveData, // 发送包含时间戳等的完整数据
      customKey: customKey,
      userId: userId,
    };

    // 6. 后台异步同步完整数据到所有服务器
    Promise.resolve().then(() => {
      logger.debug(
        `[writeAction] Initiating background sync for key: ${customKey} to ${servers.length} servers.`
      );
      syncWithServers(
        servers,
        noloWriteRequest, // 使用导入的 write 请求函数
        `Write sync failed for ${customKey} on`, // 错误消息前缀
        // --- 传递给 noloWriteRequest 的参数 ---
        serverWriteConfig, // 包含 data, customKey, userId 的对象
        state // 传递 state 用于认证
        // ------------------------------------
      );
    });

    // 7. 返回已保存到本地的数据
    return willSaveData;
  } catch (error: any) {
    // 捕获 saveToClientDb 或上面可能的验证错误
    const errorMessage = `Write action failed for ${customKey}: ${error.message || "Unknown error"}`;
    logger.error("[writeAction] Error:", error);
    toast.error(`Failed to save data for ${customKey}.`); // 用户友好的提示
    // 重新抛出错误
    throw error;
  }
};
