// 文件路径: database/actions/patch.ts

import type { AppThunkApi } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";
import { toast } from "react-hot-toast";
import { noloPatchRequest, syncWithServers, SERVERS } from "../requests";

/**
 * 深度合并两个对象。源对象中的 null 值会删除目标对象中对应的键。
 * @param target - 目标对象。
 * @param source - 源对象，包含要应用的更改。
 * @returns {any} - 合并后的新对象。
 */
const deepMerge = (target: any, source: any): any => {
  const output = { ...target };
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (source[key] === null && key in output) {
        delete output[key]; // null 值用于删除键
      } else if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        output[key] = deepMerge(output[key] || {}, source[key]); // 递归合并
      } else {
        output[key] = source[key]; // 直接赋值
      }
    }
  }
  return output;
};

/**
 * Patch Action: 对现有数据项应用增量更新。
 * 1. 从本地数据库读取现有数据。
 * 2. 将传入的 'changes' 对象与现有数据进行深度合并。
 * 3. 将合并后的新数据写回本地数据库。
 * 4. 异步地将 'changes' 对象同步到所有相关服务器。
 * @param payload - 包含 dbKey 和 changes 的对象。
 * @param {string} payload.dbKey - 要更新的数据的键。
 * @param {object} payload.changes - 要应用的更改。
 * @param thunkApi - Redux Thunk API，包含 state 和 extra arugments。
 * @returns {Promise<any>} 更新后的完整数据对象。
 * @throws 如果本地数据不存在或更新过程中发生任何错误，则抛出异常。
 */
export const patchAction = async (
  { dbKey, changes }: { dbKey: string; changes: any },
  thunkApi: AppThunkApi
): Promise<any> => {
  // 1. 从 thunkApi.extra 中获取数据库实例
  const { db } = thunkApi.extra;
  if (!db) {
    const errorMsg = "Database instance is not available.";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 2. 验证输入参数
  if (!dbKey || !changes || typeof changes !== "object") {
    const errorMsg = "Patch action requires a valid dbKey and changes object.";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);

  try {
    // 3. 使用注入的 db 实例读取当前数据
    const currentData = await db.get(dbKey);
    if (!currentData) {
      throw new Error(
        `Cannot apply patch: Data not found locally for key: ${dbKey}.`
      );
    }

    // 4. 合并数据并写回本地数据库
    const newData = deepMerge(currentData, changes);
    await db.put(dbKey, newData);

    // 5. 异步触发对远程服务器的同步
    const servers = Array.from(
      new Set([currentServer, SERVERS.MAIN, SERVERS.US].filter(Boolean))
    );

    // "即发即忘"：在下一个事件循环中开始同步，不阻塞当前操作的返回
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

    // 6. 乐观地返回更新后的数据
    return newData;
  } catch (error: any) {
    const errorMessage = `Failed to update data for ${dbKey}.`;
    toast.error(errorMessage);
    // 重新抛出错误，以便 createAsyncThunk 可以捕获到 rejected 状态
    throw new Error(error.message || errorMessage);
  }
};
