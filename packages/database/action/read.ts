// 文件路径: database/actions/read.ts

import type { AppThunkApi } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";
import { getAllServers, fetchFromClientDb, fetchFromServer } from "./common";
import { selectIsLoggedIn } from "auth/authSlice";
import { write } from "../dbSlice";

// --- 辅助函数 (保持不变) ---

const updateClientDbIfNewer = async (
  clientDb: any,
  dbKey: string,
  remoteData: any,
  localData: any
): Promise<void> => {
  if (!clientDb) return;
  try {
    if (isRemoteDataNewer(remoteData, localData)) {
      await clientDb.put(dbKey, remoteData);
    }
  } catch (err) {
    console.error("Error updating client DB:", err);
    throw err;
  }
};

const isRemoteDataNewer = (remoteData: any, localData: any): boolean => {
  const hasRemoteTimestamp = !!remoteData?.updatedAt;
  if (!hasRemoteTimestamp) return false;

  const hasLocalTimestamp = !!localData?.updatedAt;
  if (!hasLocalTimestamp) return true;

  const remoteTimestamp = new Date(remoteData.updatedAt);
  const localTimestamp = new Date(localData.updatedAt);
  return remoteTimestamp > localTimestamp;
};

const shouldSyncLocalToServer = (localData: any, remoteData: any): boolean => {
  return !!localData && !remoteData;
};

const syncLocalDataToServer = async (
  thunkApi: AppThunkApi,
  dbKey: string,
  localData: any
): Promise<void> => {
  try {
    await thunkApi
      .dispatch(
        write({
          data: localData,
          customKey: dbKey,
        })
      )
      .unwrap();
  } catch (err) {
    console.error("Error syncing local data to server:", err);
  }
};

const saveRemoteDataToClientDb = async (
  clientDb: any,
  dbKey: string,
  remoteData: any
): Promise<void> => {
  if (!clientDb) return;
  try {
    await clientDb.put(dbKey, remoteData);
  } catch (err) {
    console.error("Error saving remote data to client DB:", err);
  }
};

const getValidRemoteData = (
  settledResults: PromiseSettledResult<any>[]
): { data: any; index: number } | null => {
  const validResults = settledResults
    .map((result, index) => ({
      data: result.status === "fulfilled" ? result.value : null,
      index,
    }))
    .filter(
      (item) => item.data !== null && typeof item.data.updatedAt !== "undefined"
    );

  if (validResults.length === 0) return null;

  return validResults.reduce((latest, current) => {
    const latestTimestamp = new Date(latest.data.updatedAt);
    const currentTimestamp = new Date(current.data.updatedAt);
    return currentTimestamp > latestTimestamp ? current : latest;
  });
};

const processRemoteDataInBackground = async (
  clientDb: any,
  dbKey: string,
  remotePromises: Promise<any>[],
  allServers: string[],
  localData: any,
  thunkApi: AppThunkApi
): Promise<void> => {
  if (!clientDb) return;
  try {
    const settledResults = await Promise.allSettled(remotePromises);
    const remoteResult = getValidRemoteData(settledResults);
    const validRemoteData = remoteResult ? remoteResult.data : null;

    if (validRemoteData && localData) {
      await updateClientDbIfNewer(clientDb, dbKey, validRemoteData, localData);
    }
    if (shouldSyncLocalToServer(localData, validRemoteData)) {
      await syncLocalDataToServer(thunkApi, dbKey, localData);
    }
  } catch (err) {
    // 捕获由中止操作引起的错误，并静默处理
    if (err instanceof DOMException && err.name === "AbortError") {
      console.log("Background sync aborted for:", dbKey);
    } else {
      console.error("Error processing remote data in background:", err);
    }
  }
};

// --- 主函数 (支持中止和向后兼容) ---

export const readAction = async (
  /**
   * 负载可以是:
   * 1. 字符串 (旧的调用方式, 如 `read(id)`)
   * 2. 对象 (新的调用方式, 如 `read({ id, signal })`)
   */
  payload: string | { id: string; signal?: AbortSignal },
  thunkApi: AppThunkApi
): Promise<any> => {
  // 1. 智能解析 payload，实现向后兼容
  let dbKey: string;
  let signal: AbortSignal | undefined;

  if (typeof payload === "string") {
    dbKey = payload;
    // signal 保持 undefined
  } else {
    dbKey = payload.id;
    signal = payload.signal;
  }

  // 2. 尽早检查中止信号，快速退出
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const { db: clientDb } = thunkApi.extra;
  if (!clientDb) {
    throw new Error("Client database is not available.");
  }

  const state = thunkApi.getState();
  const token = state.auth.currentToken;
  const isLoggedIn = selectIsLoggedIn(state);
  const currentServer = selectCurrentServer(state);
  const allServers = getAllServers(currentServer);

  const localData = await fetchFromClientDb(clientDb, dbKey);

  // 3. 将 signal 传递给所有网络请求
  const remotePromises = allServers.map((server) =>
    fetchFromServer(server, dbKey, isLoggedIn ? token : undefined, signal)
  );

  if (localData) {
    // 如果本地有数据，立即返回以优化UI响应速度
    // 并在后台进行数据同步（如果未被中止）
    if (!signal?.aborted) {
      processRemoteDataInBackground(
        clientDb,
        dbKey,
        remotePromises,
        allServers,
        localData,
        thunkApi
      );
    }
    return localData;
  }

  // 如果本地没有数据，则等待网络请求结果
  const settledResults = await Promise.allSettled(remotePromises);

  // 4. 在处理网络结果前，再次检查中止信号
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const remoteResult = getValidRemoteData(settledResults);
  if (remoteResult) {
    const { data: validRemoteData } = remoteResult;
    // 在写入数据库前最后一次检查
    if (!signal?.aborted) {
      await saveRemoteDataToClientDb(clientDb, dbKey, validRemoteData);
    }
    return validRemoteData;
  }

  throw new Error(`Failed to fetch data for key "${dbKey}" from all sources.`);
};
