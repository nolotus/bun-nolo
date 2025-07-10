// 文件路径: database/actions/read.ts

// 1. 【新增】从你的 store 配置中导入 AppThunkApi 类型
import type { AppThunkApi } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";
import { getAllServers, fetchFromClientDb, fetchFromServer } from "./common";
import { selectIsLoggedIn } from "auth/authSlice";
import { write } from "../dbSlice";

// --- 辅助函数保持不变，但我们可以增强它们的类型 ---

// 更新客户端数据库
const updateClientDbIfNewer = async (
  clientDb: any, // 保持 any 或定义一个更具体的 DB 接口类型
  dbKey: string,
  remoteData: any,
  localData: any
): Promise<void> => {
  // ... 函数内部逻辑不变
  if (!clientDb) {
    return;
  }
  try {
    if (isRemoteDataNewer(remoteData, localData)) {
      await clientDb.put(dbKey, remoteData);
    }
  } catch (err) {
    throw err;
  }
};

// 判断远程数据是否更新
const isRemoteDataNewer = (remoteData: any, localData: any): boolean => {
  // ... 函数内部逻辑不变
  const hasRemoteTimestamp = !!remoteData?.updatedAt;
  if (!hasRemoteTimestamp) return false;

  const hasLocalTimestamp = !!localData?.updatedAt;
  if (!hasLocalTimestamp) return true;

  const remoteTimestamp = new Date(remoteData.updatedAt);
  const localTimestamp = new Date(localData.updatedAt);
  return remoteTimestamp > localTimestamp;
};

// 判断是否需要同步本地到服务器
const shouldSyncLocalToServer = (localData: any, remoteData: any): boolean => {
  // ... 函数内部逻辑不变
  return !!localData && !remoteData;
};

// 同步本地数据到服务器
// 4. 【类型增强】将 thunkApi 的类型从 any 改为 AppThunkApi
const syncLocalDataToServer = async (
  thunkApi: AppThunkApi,
  dbKey: string,
  localData: any
): Promise<void> => {
  // ... 函数内部逻辑不变
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
    // 错误处理
  }
};

// 保存远程数据到客户端DB
const saveRemoteDataToClientDb = async (
  clientDb: any,
  dbKey: string,
  remoteData: any
): Promise<void> => {
  // ... 函数内部逻辑不变
  if (!clientDb) {
    return;
  }
  try {
    await clientDb.put(dbKey, remoteData);
  } catch (err) {
    // 错误处理
  }
};

// 获取有效的远程数据
const getValidRemoteData = (
  settledResults: PromiseSettledResult<any>[]
): { data: any; index: number } | null => {
  // ... 函数内部逻辑不变
  const validResults = settledResults
    .map((result, index) => ({
      data: result.status === "fulfilled" ? result.value : null,
      index,
    }))
    .filter((item) => item.data !== null && item.data.updatedAt);

  if (validResults.length === 0) return null;

  const latestResult = validResults.reduce((latest, current) => {
    const latestTimestamp = new Date(latest.data.updatedAt);
    const currentTimestamp = new Date(current.data.updatedAt);
    return currentTimestamp > latestTimestamp ? current : latest;
  });

  return { data: latestResult.data, index: latestResult.index };
};

// 处理后台远程数据
// 4. 【类型增强】将 thunkApi 的类型从 any 改为 AppThunkApi
const processRemoteDataInBackground = async (
  clientDb: any,
  dbKey: string,
  remotePromises: Promise<any>[],
  allServers: string[],
  localData: any,
  thunkApi: AppThunkApi
): Promise<void> => {
  // ... 函数内部逻辑不变
  if (!clientDb) {
    return;
  }
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
    // 错误处理
  }
};

// --- 主函数改造 ---

// 2. 【修改函数签名】移除第三个参数 clientDb，并将 thunkApi 类型设为 AppThunkApi
export const readAction = async (
  dbKey: string,
  thunkApi: AppThunkApi
): Promise<any> => {
  // 3. 【核心改动】从 thunkApi.extra 中获取数据库实例
  const { db: clientDb } = thunkApi.extra;

  if (!clientDb) {
    throw new Error(
      "Client database is not available in thunk extra argument."
    );
  }

  // 从这里开始，函数的其余部分几乎保持不变，因为它们都依赖于 `clientDb` 变量
  const state = thunkApi.getState();
  const token = state.auth.currentToken;
  const currentServer = selectCurrentServer(state);

  const allServers = getAllServers(currentServer);
  // fetchFromClientDb 使用我们从 thunkApi 中获取的 clientDb
  const localData = await fetchFromClientDb(clientDb, dbKey);
  const remotePromises = allServers.map((server) =>
    fetchFromServer(server, dbKey, selectIsLoggedIn(state) ? token : undefined)
  );

  if (localData) {
    processRemoteDataInBackground(
      clientDb,
      dbKey,
      remotePromises,
      allServers,
      localData,
      thunkApi
    ).catch((err) => {});
    return localData;
  }

  const settledResults = await Promise.allSettled(remotePromises);
  const remoteResult = getValidRemoteData(settledResults);
  if (remoteResult) {
    const { data: validRemoteData } = remoteResult;
    await saveRemoteDataToClientDb(clientDb, dbKey, validRemoteData);
    return validRemoteData;
  }

  throw new Error("Failed to fetch data from all sources");
};
