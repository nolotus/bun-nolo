// database/actions/readAndWait.ts
import { browserDb } from "../browser/db";
import { selectCurrentServer } from "setting/settingSlice";
import { getAllServers, fetchFromClientDb, fetchFromServer } from "./common";
import { selectIsLoggedIn } from "auth/authSlice";
import { write } from "../dbSlice";

// 更新客户端数据库（仅当远程数据更新时）
const updateClientDbIfNewer = async (
  clientDb: any,
  dbKey: string,
  remoteData: any,
  localData: any
): Promise<void> => {
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
    // 错误处理
  }
};

// 保存远程数据到客户端数据库
const saveRemoteDataToClientDb = async (
  clientDb: any,
  dbKey: string,
  remoteData: any
): Promise<void> => {
  if (!clientDb) {
    return;
  }
  try {
    await clientDb.put(dbKey, remoteData);
  } catch (err) {
    // 错误处理
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

// 处理远程数据的逻辑
const processRemoteData = async (
  clientDb: any,
  dbKey: string,
  remotePromises: Promise<any>[],
  localData: any,
  thunkApi: any
): Promise<any> => {
  if (!clientDb) {
    throw new Error("Client database is undefined");
  }

  try {
    const settledResults = await Promise.allSettled(remotePromises);
    const remoteResult = getValidRemoteData(settledResults);
    const validRemoteData = remoteResult ? remoteResult.data : null;

    if (validRemoteData) {
      if (localData) {
        await updateClientDbIfNewer(
          clientDb,
          dbKey,
          validRemoteData,
          localData
        );
      } else {
        await saveRemoteDataToClientDb(clientDb, dbKey, validRemoteData);
      }

      if (shouldSyncLocalToServer(localData, validRemoteData)) {
        await syncLocalDataToServer(thunkApi, dbKey, localData);
      }

      return validRemoteData;
    }

    // 如果没有有效的远程数据，但有本地数据，则返回本地数据
    if (localData) {
      return localData;
    }

    throw new Error("Failed to fetch data from all sources");
  } catch (err) {
    // 如果出错且有本地数据，则返回本地数据
    if (localData) {
      return localData;
    }
    throw new Error("Failed to fetch data from all sources");
  }
};

// 主函数 - 等待所有数据获取完成后再返回
export const readAndWaitAction = async (
  dbKey: string,
  thunkApi: any,
  clientDb: any = browserDb
): Promise<any> => {
  if (!clientDb) {
    throw new Error("Client database is undefined in readAndWaitAction");
  }

  const state = thunkApi.getState();
  const token = state.auth.currentToken;
  const currentServer = selectCurrentServer(state);

  const allServers = getAllServers(currentServer);
  const localData = await fetchFromClientDb(clientDb, dbKey);

  const remotePromises = allServers.map((server) =>
    fetchFromServer(server, dbKey, selectIsLoggedIn(state) ? token : undefined)
  );

  return processRemoteData(
    clientDb,
    dbKey,
    remotePromises,
    localData,
    thunkApi
  );
};
