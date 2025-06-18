// database/actions/patch.ts
import { selectCurrentServer } from "setting/settingSlice";
import { browserDb } from "../browser/db";
import { toast } from "react-hot-toast";
import { noloPatchRequest, syncWithServers, SERVERS } from "../requests";

// 深度合并工具函数，支持删除（null 值）
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
  if (!dbKey || !changes || typeof changes !== "object") {
    const errorMsg =
      "Invalid arguments for patchAction: dbKey and changes object are required.";
    console.error(errorMsg, { dbKey, changes });
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);

  try {
    const currentData = await browserDb.get(dbKey);
    if (!currentData) {
      throw new Error(
        `Data not found locally for key: ${dbKey}. Cannot apply patch.`
      );
    }

    const newData = deepMerge(currentData, changes);

    await browserDb.put(dbKey, newData);

    const servers = Array.from(
      new Set([currentServer, SERVERS.MAIN, SERVERS.US].filter(Boolean))
    );

    Promise.resolve().then(() => {
      syncWithServers(
        servers,
        noloPatchRequest,
        `Patch sync failed for ${dbKey} on`,
        dbKey,
        changes,
        state
      );
    });

    return newData;
  } catch (error: any) {
    const errorMessage = `Patch action failed for ${dbKey}: ${error.message || "Unknown error"}`;
    console.error("[patchAction] Error:", error);
    toast.error(`Failed to update data for ${dbKey}.`);
    throw error;
  }
};
