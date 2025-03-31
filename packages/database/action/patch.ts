// src/database/actions/patchAction.ts
import { selectCurrentServer } from "setting/settingSlice";
import { browserDb } from "../browser/db";
import { toast } from "react-hot-toast";
import {
  noloPatchRequest, // 导入 patch 请求函数
  syncWithServers, // 导入通用同步函数
  CYBOT_SERVERS, // 保留 CYBOT_SERVERS 用于生成服务器列表
} from "../requests";
// import { API_ENDPOINTS } from "../config"; // API_ENDPOINTS 不再直接使用，可以移除

// 深度合并工具函数，支持删除（null 值）
// 如果多处使用，考虑移到公共 utils
const deepMerge = (target: any, source: any): any => {
  const output = { ...target };
  for (const key in source) {
    // eslint-disable-next-line no-prototype-builtins
    if (!source.hasOwnProperty(key)) continue;

    if (source[key] === null && key in output) {
      delete output[key]; // 处理 null 删除
    } else if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      // 递归合并对象
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else {
      // 直接赋值原始值或数组
      output[key] = source[key];
    }
  }
  return output;
};

/**
 * Patch Action: 更新现有数据项。
 * 1. 从本地数据库读取现有数据。
 * 2. 合并现有数据和传入的更改。
 * 3. 更新本地数据库。
 * 4. 异步将更改 (patch) 同步到服务器。
 * @param {object} payload - 包含 dbKey 和 changes 的对象。
 * @param {string} payload.dbKey - 要更新的数据的键。
 * @param {object} payload.changes - 要应用的更改。
 * @param {object} thunkApi - Redux Thunk API。
 * @returns {Promise<any>} 更新后的完整数据对象。
 * @throws {Error} 如果本地数据未找到或本地更新失败。
 */
export const patchAction = async (
  { dbKey, changes }: { dbKey: string; changes: any },
  thunkApi: any
): Promise<any> => {
  if (!dbKey || !changes || typeof changes !== "object") {
    const errorMsg =
      "Invalid arguments for patchAction: dbKey and changes object are required.";
    console.error(errorMsg, { dbKey, changes });
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state); // 获取当前设置的服务器

  try {
    // 1. 读取当前数据
    const currentData = await browserDb.get(dbKey);
    if (!currentData) {
      // 如果数据在本地不存在，patch 操作无法进行
      throw new Error(
        `Data not found locally for key: ${dbKey}. Cannot apply patch.`
      );
    }

    // 2. 准备更新数据，强制更新 updatedAt
    const updatedChanges = {
      ...changes, // 应用传入的更改
      updatedAt: new Date().toISOString(), // 确保 updatedAt 是最新的
    };

    // 3. 深度合并当前数据和更新数据
    const newData = deepMerge(currentData, updatedChanges);

    // 4. 本地更新 (优先保证本地操作成功)
    await browserDb.put(dbKey, newData);
    console.debug(`[patchAction] Local data updated for key: ${dbKey}`);

    // 5. 准备服务器列表 (包括当前服务器和固定的 CYBOT 服务器)
    // 使用 Set 自动去重
    const servers = Array.from(
      new Set(
        [currentServer, CYBOT_SERVERS.ONE, CYBOT_SERVERS.RUN].filter(Boolean)
      ) // filter(Boolean) 过滤掉可能为空的 currentServer
    );

    // 6. 后台异步同步（只发送增量更新 `updatedChanges`）
    // 使用 Promise.resolve().then() 确保在当前调用栈结束后执行
    Promise.resolve().then(() => {
      console.debug(
        `[patchAction] Initiating background sync for key: ${dbKey} to ${servers.length} servers.`
      );
      syncWithServers(
        servers,
        noloPatchRequest, // 使用导入的 patch 请求函数
        `Patch sync failed for ${dbKey} on`, // 错误消息前缀
        // --- 传递给 noloPatchRequest 的参数 ---
        dbKey,
        updatedChanges, // 只发送实际的更改内容
        state // 传递 state 用于认证等
        // -------------------------------------
      );
    });

    // 7. 返回合并后的新数据，供 Redux 更新或其他逻辑使用
    return newData;
  } catch (error: any) {
    // 处理本地操作错误或上面抛出的 "Data not found" 错误
    const errorMessage = `Patch action failed for ${dbKey}: ${error.message || "Unknown error"}`;
    console.error("[patchAction] Error:", error);
    toast.error(`Failed to update data for ${dbKey}.`); // 用户友好的错误提示
    // 重新抛出错误，以便调用者（如 async thunk）可以知道操作失败
    throw error;
  }
};
