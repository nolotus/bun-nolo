// src/database/actions/upsertAction.ts
import { toast } from "react-hot-toast";
import { AppThunkApi } from "app/store";

import { read, patch, write } from "../dbSlice";

/**
 * Upsert 数据协调器：根据数据是否存在，调度 patch 或 write 操作。
 * 此操作本身不执行数据库读写或网络请求，而是委托给其他 async thunks。
 *
 * @param upsertConfig 包含 dbKey（必需）和 data（必需）的对象。
 * @param thunkApi Redux Thunk API，包含 dispatch 和 getState。
 * @returns Promise<any> 来自 patch或write操作成功后的数据对象。
 * @throws 如果参数无效或调度的操作失败，则抛出错误。
 */
export const upsertAction = async (
  upsertConfig: { dbKey: string; data: any },
  thunkApi: AppThunkApi
): Promise<any> => {
  const { dbKey, data } = upsertConfig;
  const { dispatch } = thunkApi;

  // 1. 参数验证
  if (!dbKey || !data || typeof data !== "object") {
    const errorMsg = "upsertAction 参数无效：dbKey 和 data 对象是必需的。";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // 2. 调用 readAction 检查数据是否存在于本地（通过 Redux Store 或 DB）
    // 我们不关心 readAction 是否真的从网络读取，只关心它最终返回的结果。
    const readResult = await dispatch(read(dbKey));
    const existingData = readResult.payload;

    let finalResultAction;

    // 3. 根据是否存在数据，决定调度 patch 还是 write
    if (existingData && Object.keys(existingData).length > 0) {
      // **更新路径**：数据已存在，调度 patch action
      // patch action 内部会处理 updatedAt、userId、本地写入和服务器同步
      finalResultAction = await dispatch(patch({ dbKey, changes: data }));
    } else {
      // **插入路径**：数据不存在，调度 write action
      // write action 内部会处理 createdAt/updatedAt、userId、本地写入和服务器同步
      finalResultAction = await dispatch(write({ data, customKey: dbKey }));
    }

    // 检查被调度的 thunk 是否出错
    if (finalResultAction.meta.requestStatus === "rejected") {
      // 如果内部 thunk 失败，则抛出其错误
      throw finalResultAction.payload || new Error("Upsert 内部操作失败");
    }

    // 4. 返回最终执行成功的数据
    return finalResultAction.payload;
  } catch (error: any) {
    const errorMessage = `Upsert 协调操作失败 (dbKey: ${dbKey}): ${error.message || "未知错误"}`;
    toast.error("数据保存失败，请稍后重试。");
    // 重新抛出错误，以便 create.asyncThunk 能捕获到 rejected 状态
    throw new Error(errorMessage, { cause: error });
  }
};
