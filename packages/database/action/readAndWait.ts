// 文件路径: database/actions/readAndWait.ts

import type { AppThunkApi } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";
import { getAllServers, fetchFromClientDb, fetchFromServer } from "./common";
import { selectIsLoggedIn } from "auth/authSlice";
import { write } from "../dbSlice";

/**
 * 比较远程数据和本地数据的时间戳，判断远程数据是否更新。
 * @param remoteData - 从服务器获取的数据。
 * @param localData - 从本地数据库获取的数据。
 * @returns {boolean} - 如果远程数据更新，则返回 true。
 */
const isRemoteDataNewer = (remoteData: any, localData: any): boolean => {
  const hasRemoteTimestamp = !!remoteData?.updatedAt;
  // 如果远程数据没有时间戳，则它不是“更新”的。
  if (!hasRemoteTimestamp) return false;

  const hasLocalTimestamp = !!localData?.updatedAt;
  // 如果本地数据没有时间戳，那么任何有时间戳的远程数据都算“更新”。
  if (!hasLocalTimestamp) return true;

  const remoteTimestamp = new Date(remoteData.updatedAt);
  const localTimestamp = new Date(localData.updatedAt);
  return remoteTimestamp > localTimestamp;
};

/**
 * 触发一个“即发即忘”的异步任务，将本地数据上传（写入）到服务器。
 * 这通常在发现本地存在数据而所有远程服务器上都不存在该数据时调用。
 * @param thunkApi - Redux Thunk API，用于 dispatch 其他 action。
 * @param dbKey - 数据的键。
 * @param localData - 要上传的本地数据。
 */
const syncLocalDataToServer = async (
  thunkApi: AppThunkApi,
  dbKey: string,
  localData: any
): Promise<void> => {
  try {
    // 调用 write action 将数据推向服务器，不等待其完成。
    await thunkApi
      .dispatch(write({ data: localData, customKey: dbKey }))
      .unwrap();
  } catch (err) {
    // 此为后台同步操作，即使失败也不应阻塞主流程，因此静默处理错误。
  }
};

/**
 * 从所有远程服务器的请求结果中，筛选出有效的、时间戳最新的那一份数据。
 * @param settledResults - Promise.allSettled 返回的结果数组。
 * @returns {object | null} - 包含最新数据及其来源索引的对象，或在没有有效数据时返回 null。
 */
const getValidRemoteData = (
  settledResults: PromiseSettledResult<any>[]
): { data: any; index: number } | null => {
  const validResults = settledResults
    .map((result, index) => ({
      data: result.status === "fulfilled" ? result.value : null,
      index,
    }))
    // 筛选条件：请求成功，且返回的数据不为 null，并且必须包含 updatedAt 字段。
    .filter((item) => item.data !== null && item.data.updatedAt);

  if (validResults.length === 0) return null;

  // 从所有有效的远程数据中，选出时间戳最新的那一个。
  return validResults.reduce((latest, current) => {
    const latestTimestamp = new Date(latest.data.updatedAt);
    const currentTimestamp = new Date(current.data.updatedAt);
    return currentTimestamp > latestTimestamp ? current : latest;
  });
};

/**
 * 核心处理函数：协调本地和远程数据，决定最终返回哪个版本的数据，并处理同步逻辑。
 * @param db - 数据库实例。
 * @param dbKey - 数据的键。
 * @param remotePromises - 所有到远程服务器的数据获取请求。
 * @param localData - 预先从本地数据库获取的数据。
 * @param thunkApi - Redux Thunk API。
 * @returns {Promise<any>} - 最终决定的数据。
 */
const processRemoteData = async (
  db: any,
  dbKey: string,
  remotePromises: Promise<any>[],
  localData: any,
  thunkApi: AppThunkApi
): Promise<any> => {
  try {
    // 并行执行所有远程请求，并等待它们全部完成（无论成功或失败）。
    const settledResults = await Promise.allSettled(remotePromises);
    // 从所有结果中，找出最“权威”的远程版本（时间戳最新）。
    const remoteResult = getValidRemoteData(settledResults);
    const validRemoteData = remoteResult ? remoteResult.data : null;

    // --- 数据决策核心逻辑 ---

    // 场景 1: 成功从至少一个远程服务器获取到了有效数据。
    // 这是最理想的情况，表明数据在云端存在且可访问。
    if (validRemoteData) {
      // 决策：何时用远程数据更新本地缓存？
      // 条件：A. 本地根本没有这份数据(!localData)。
      //       B. 或者，本地有数据，但远程的数据版本更新。
      if (!localData || isRemoteDataNewer(validRemoteData, localData)) {
        await db.put(dbKey, validRemoteData);
      }
      // 最终决策：返回权威的远程数据。这是最高优先级的数据源。
      return validRemoteData;
    }

    // 场景 2: 所有远程服务器都没有返回有效数据，但我们本地数据库中存在数据。
    // 这可能意味着用户离线，或服务器暂时不可用，或数据只存在于本设备。
    if (localData) {
      // 决策：将本地数据同步（上传）到云端。
      // 因为我们确认了远程没有而本地有，这表明本地数据是“孤本”，需要备份。
      syncLocalDataToServer(thunkApi, dbKey, localData);

      // 最终决策：返回本地数据。这是次优的数据源，但能保证离线可用性。
      return localData;
    }

    // 场景 3: 远程和本地都找不到任何数据。
    // 这意味着这份数据彻底不存在。
    throw new Error("Failed to fetch data from all sources");
  } catch (err) {
    // 异常捕获：如果在上述 try 块中发生任何错误（例如 db.put 失败）。
    // 作为一个安全备用策略，如果此时我们手头有本地数据，就返回它，以避免应用崩溃。
    if (localData) {
      return localData;
    }
    // 如果连备用的本地数据都没有，就只能将错误抛出。
    throw err;
  }
};

/**
 * 主函数：读取数据，并等待远程和本地操作都完成后才返回最合适的数据。
 * 这是一个有阻塞的读取操作，确保了数据的一致性。
 */
export const readAndWaitAction = async (
  dbKey: string,
  thunkApi: AppThunkApi
): Promise<any> => {
  // 通过 thunk 的 extraArgument 获取数据库实例，实现与具体数据库实现的解耦。
  const { db } = thunkApi.extra;

  if (!db) {
    throw new Error(
      "Database instance is not available in thunk extra argument."
    );
  }

  const state = thunkApi.getState();
  const token = state.auth.currentToken;
  const currentServer = selectCurrentServer(state);

  // 1. 准备所有需要的信息
  const allServers = getAllServers(currentServer);

  // 2. 首先，尝试从本地数据库获取数据（可能为 null）
  const localData = await fetchFromClientDb(db, dbKey);

  // 3. 创建所有到远程服务器的并行请求
  const remotePromises = allServers.map((server) =>
    fetchFromServer(server, dbKey, selectIsLoggedIn(state) ? token : undefined)
  );

  // 4. 将所有信息交给核心处理函数去做最终决策
  return processRemoteData(db, dbKey, remotePromises, localData, thunkApi);
};
