// database/actions/read.ts
import { browserDb } from "../browser/db";
import { selectCurrentServer } from "setting/settingSlice";
import pino from "pino";
import { API_ENDPOINTS } from "../config";
import { getAllServers, fetchFromClientDb } from "./common";
import { selectIsLoggedIn } from "auth/authSlice";

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

// 从单个服务器获取数据
const fetchFromServer = async (
  server: string,
  dbKey: string,
  token?: string
): Promise<any> => {
  try {
    const res = await fetch(
      `${server}${API_ENDPOINTS.DATABASE}/read/${dbKey}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (res.status === 200) {
      return await res.json();
    }
    logger.warn({ status: res.status, server }, "Fetch failed");
    return null;
  } catch (err) {
    logger.error({ err, server }, "Fetch error");
    return null;
  }
};

// 更新客户端数据库（仅当远程数据更新时）
const updateClientDbIfNewer = async (
  clientDb: any,
  dbKey: string,
  remoteData: any,
  localData: any
): Promise<void> => {
  if (!clientDb) {
    logger.error(
      { dbKey },
      "Client database is undefined in updateClientDbIfNewer"
    );
    return;
  }
  try {
    if (isRemoteDataNewer(remoteData, localData)) {
      await clientDb.put(dbKey, remoteData);
    }
  } catch (err) {
    logger.error({ err, dbKey }, "Failed to update local data");
    throw err;
  }
};

// 判断远程数据是否存在且比本地数据新
const isRemoteDataNewer = (remoteData: any, localData: any): boolean => {
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
    logger.error({ err }, "Failed to sync local data to server");
  }
};

// 保存远程数据到客户端数据库
const saveRemoteDataToClientDb = async (
  clientDb: any,
  dbKey: string,
  remoteData: any
): Promise<void> => {
  if (!clientDb) {
    logger.error(
      { dbKey },
      "Client database is undefined in saveRemoteDataToClientDb"
    );
    return;
  }
  try {
    await clientDb.put(dbKey, remoteData);
  } catch (err) {
    logger.error({ err, dbKey }, "Failed to save remote data locally");
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
    logger.error(
      { dbKey },
      "Client database is undefined in processRemoteDataInBackground"
    );
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
    logger.error({ err }, "Background remote data processing failed");
  }
};

// 主函数
export const readAction = async (
  dbKey: string,
  thunkApi: any,
  clientDb: any = browserDb
): Promise<any> => {
  if (!clientDb) {
    const errorMsg = "Client database is undefined in readAction";
    logger.error({ dbKey }, errorMsg);
    throw new Error(errorMsg);
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
    ).catch((err) => logger.error({ err }, "Background processing failed"));
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
