import { browserDb } from "../browser/db";
import { selectCurrentServer } from "setting/settingSlice";
import { toast } from "react-hot-toast";
import { noloPatchRequest } from "../requests";

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
      // 如果值为 null，则删除该键
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
          toast.error(`Failed to update on ${server}`);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
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
      toast.error(`Data not found locally`);
      throw new Error("Data not found");
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
    toast.error(`Patch action failed: ${error.message}`);
    throw error;
  }
};
