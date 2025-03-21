import { selectCurrentServer } from "setting/settingSlice";
import { browserDb } from "../browser/db";
import { toast } from "react-hot-toast";
import { noloRequest } from "../requests";
import { API_ENDPOINTS } from "../config";

// 更新请求
const noloPatchRequest = async (
  server: string,
  dbKey: string,
  updates: any,
  state: any,
  signal?: AbortSignal
) => {
  try {
    const response = await noloRequest(
      server,
      {
        url: `${API_ENDPOINTS.DATABASE}/patch/${dbKey}`,
        method: "PATCH",
        body: JSON.stringify(updates),
      },
      state,
      signal
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error; // 重新抛出错误以便上层处理
  }
};

const CYBOT_SERVERS = {
  ONE: "https://cybot.one",
  RUN: "https://cybot.run",
};

const TIMEOUT = 5000;

// 深度合并工具函数，支持删除（null 值）
const deepMerge = (target: any, source: any): any => {
  const output = { ...target };
  for (const key in source) {
    if (source[key] === null && key in output) {
      delete output[key];
    } else if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
};

const syncWithServers = (
  servers: string[],
  dbKey: string,
  updates: any,
  state: any
) => {
  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, TIMEOUT);

    noloPatchRequest(server, dbKey, updates, state, abortController.signal)
      .then((success) => {
        clearTimeout(timeoutId);
        if (!success) {
          console.error(`Sync failed with ${server}: Request unsuccessful`);
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        const errorMessage = `Sync failed with ${server}: ${
          error.message || "Unknown error"
        }`;
        toast.error(errorMessage);
      });
  });
};

export const patchAction = async ({ dbKey, changes }, thunkApi) => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);

  try {
    // 读取当前数据
    const currentData = await browserDb.get(dbKey);
    if (!currentData) {
      throw new Error(`Data not found locally for key: ${dbKey}`);
    }

    // 准备更新数据，统一设置 updatedAt
    const updatedChanges = {
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    // 深度合并当前数据和更新数据
    const newData = deepMerge(currentData, updatedChanges);

    // 本地更新
    await browserDb.put(dbKey, newData);

    // 准备服务器列表
    const servers = Array.from(
      new Set([currentServer, CYBOT_SERVERS.ONE, CYBOT_SERVERS.RUN])
    );

    // 后台同步（只发送增量更新）
    Promise.resolve().then(() => {
      syncWithServers(servers, dbKey, updatedChanges, state);
    });

    return newData;
  } catch (error) {
    const errorMessage = `Patch action failed for ${dbKey}: ${
      error.message || "Unknown error"
    }`;
    toast.error(errorMessage);
    throw error;
  }
};
