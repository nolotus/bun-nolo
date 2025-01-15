import { browserDb } from "../browser/db";
import { API_ENDPOINTS } from "../config";
import { selectCurrentServer } from "setting/settingSlice";
import { pipe } from "rambda";

// 抽离请求逻辑
const makeRequest = async (state, { url, method = "GET", body }) => {
  const headers = {
    "Content-Type": "application/json",
    ...(state.auth?.currentToken && {
      Authorization: `Bearer ${state.auth.currentToken}`,
    }),
  };

  const response = await fetch(selectCurrentServer(state) + url, {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

// 处理远程同步
const syncWithRemote = async (state, id, updates) => {
  try {
    await makeRequest(state, {
      url: `${API_ENDPOINTS.DATABASE}/patch/${id}`,
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error(`Remote sync failed for id: ${id}:`, error);
    // 这里可以将失败的更新存入队列以便后续重试
    throw error; // 向上传递错误但不影响本地操作
  }
};

export const patchAction = async ({ id, changes }, thunkApi) => {
  const state = thunkApi.getState();

  // 准备更新数据
  const updatedChanges = {
    ...changes,
    updatedAt: new Date().toISOString(),
  };

  return pipe(
    // 1. 读取并更新本地数据
    async () => {
      try {
        const local = await browserDb.get(id);
        const newData = {
          ...local,
          ...updatedChanges,
        };

        await browserDb.put(id, newData);
        return newData;
      } catch (error) {
        console.error(`Local update failed for id: ${id}:`, error);
        throw error; // 本地更新失败需要立即返回错误
      }
    },
    // 2. 异步更新远程
    async (newData) => {
      // 使用 Promise.race 来设置超时
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Remote sync timeout")), 5000)
      );

      // 后台进行远程更新，不阻塞主流程
      Promise.race([
        syncWithRemote(state, id, updatedChanges),
        timeoutPromise,
      ]).catch((error) => {
        console.warn("Remote sync issue:", error.message);
        // 可以将失败的同步存入重试队列
      });

      return newData; // 无论远程同步是否成功都返回更新后的数据
    }
  )();
};
