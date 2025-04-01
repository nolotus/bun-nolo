// src/database/actions/patch.ts
import { selectCurrentServer } from "setting/settingSlice"; // 确认导入路径
import { browserDb } from "../browser/db"; // 确认导入路径
import { toast } from "react-hot-toast"; // 确认导入
import { noloPatchRequest, syncWithServers, CYBOT_SERVERS } from "../requests"; // 确认导入路径

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
 * 2. 使用传入的 changes 合并现有数据。 (不再强制添加 updatedAt)
 * 3. 更新本地数据库。
 * 4. 异步将传入的 changes 同步到服务器。
 * @param {object} payload - 包含 dbKey 和 changes 的对象。
 * @param {string} payload.dbKey - 要更新的数据的键。
 * @param {object} payload.changes - 要应用的更改 (应由调用者包含时间戳)。
 * @param {object} thunkApi - Redux Thunk API。
 * @returns {Promise<any>} 更新后的完整数据对象。
 * @throws {Error} 如果本地数据未找到或本地更新失败。
 */
export const patchAction = async (
  { dbKey, changes }: { dbKey: string; changes: any },
  thunkApi: any
): Promise<any> => {
  // --- 输入验证 (保持不变) ---
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
    // --- 1. 读取当前数据 (保持不变) ---
    const currentData = await browserDb.get(dbKey);
    if (!currentData) {
      // 如果数据在本地不存在，patch 操作无法进行
      throw new Error(
        `Data not found locally for key: ${dbKey}. Cannot apply patch.`
      );
    }

    // --- 2. 移除强制更新 updatedAt 的步骤 ---
    // const updatedChanges = { ... }; // 不再需要

    // --- 3. 深度合并当前数据和传入的原始 changes ---
    const newData = deepMerge(currentData, changes); // 使用原始 changes

    // --- 4. 本地更新 (优先保证本地操作成功) (保持不变) ---
    await browserDb.put(dbKey, newData);
    console.debug(`[patchAction] Local data updated for key: ${dbKey}`);

    // --- 5. 准备服务器列表 (保持不变) ---
    const servers = Array.from(
      new Set(
        [currentServer, CYBOT_SERVERS.ONE, CYBOT_SERVERS.RUN].filter(Boolean)
      ) // filter(Boolean) 过滤掉可能为空的 currentServer
    );

    // --- 6. 后台异步同步（发送传入的原始 changes） ---
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
        changes, // <--- 使用原始 changes
        state // 传递 state 用于认证等
        // -------------------------------------
      );
    });

    // --- 7. 返回合并后的新数据，供 Redux 更新或其他逻辑使用 (保持不变) ---
    return newData;
  } catch (error: any) {
    // --- 错误处理 (保持不变) ---
    const errorMessage = `Patch action failed for ${dbKey}: ${error.message || "Unknown error"}`;
    console.error("[patchAction] Error:", error);
    toast.error(`Failed to update data for ${dbKey}.`); // 用户友好的错误提示
    // 重新抛出错误，以便调用者（如 async thunk）可以知道操作失败
    throw error;
  }
};
