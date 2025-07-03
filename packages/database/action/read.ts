// database/actions/read.ts
import { browserDb } from "../browser/db";
import { selectCurrentServer } from "app/settings/settingSlice";
import { getAllServers, fetchFromClientDb, fetchFromServer } from "./common";
import { selectIsLoggedIn } from "auth/authSlice";
import { write } from "../dbSlice";

// 从单个服务器获取数据

// 更新客户端数据库（仅当远程数据更新时）
const updateClientDbIfNewer = async (
  clientDb: any,
  dbKey: string,
  remoteData: any,
  localData: any
): Promise<void> => {
  if (!clientDb) {
    return; // 原日志已删除
  }
  try {
    if (isRemoteDataNewer(remoteData, localData)) {
      await clientDb.put(dbKey, remoteData);
    }
  } catch (err) {
    throw err; // 原日志已删除
  }
};

// 判断远程数据是否存在且比本地数据新
const isRemoteDataNewer = (remoteData: any, localData: any): boolean => {
  // 删除了console.log语句
  const hasRemoteTimestamp = !!remoteData?.updatedAt;
  if (!hasRemoteTimestamp) return false;

  const hasLocalTimestamp = !!localData?.updatedAt;
  if (!hasLocalTimestamp) return true;

  const remoteTimestamp = new Date(remoteData.updatedAt);
  const localTimestamp = new Date(localData.updatedAt);
  return remoteTimestamp > localTimestamp;
};

// 判断是否需要将本地数据同步到服务器（本地有，远程无）
const shouldSyncLocalToServer = (localData: any, remoteData: any): boolean => {
  return !!localData && !remoteData;
};

// 将本地数据同步到服务器
const syncLocalDataToServer = async (
  thunkApi: any,
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
    // 原日志已删除
  }
};

// 保存远程数据到客户端数据库
const saveRemoteDataToClientDb = async (
  clientDb: any,
  dbKey: string,
  remoteData: any
): Promise<void> => {
  if (!clientDb) {
    return; // 原日志已删除
  }
  try {
    await clientDb.put(dbKey, remoteData);
  } catch (err) {
    // 原日志已删除
  }
};

// 获取更新时间最新的远程数据
const getValidRemoteData = (
  settledResults: PromiseSettledResult<any>[]
): { data: any; index: number } | null => {
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

// 处理远程数据的后台逻辑
const processRemoteDataInBackground = async (
  clientDb: any,
  dbKey: string,
  remotePromises: Promise<any>[],
  allServers: string[],
  localData: any,
  thunkApi: any
): Promise<void> => {
  if (!clientDb) {
    return; // 原日志已删除
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
    // 原日志已删除
  }
};

// 主函数
export const readAction = async (
  dbKey: string,
  thunkApi: any,
  clientDb: any = browserDb
): Promise<any> => {
  if (!clientDb) {
    throw new Error("Client database is undefined in readAction"); // 原日志已删除
  }
  const state = thunkApi.getState();
  const token = state.auth.currentToken;
  const currentServer = selectCurrentServer(state);

  const allServers = getAllServers(currentServer);
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
    ).catch((err) => {}); // 原日志已删除
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
