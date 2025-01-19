import { selectCurrentServer } from "setting/settingSlice";
import { selectIsLoggedIn } from "auth/authSlice";
import { API_ENDPOINTS } from "database/config";
import { toast } from "react-hot-toast";
import { browserDb } from "../browser/db";

const noloReadRequest = async (server: string, id: string, token?: string) => {
  const url = `${API_ENDPOINTS.DATABASE}/read/${id}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(server + url, {
    headers,
  });
  return res;
};

export const readAction = async (id: string, thunkApi) => {
  const state = thunkApi.getState();
  const token = state.auth.currentToken;
  const isLoggedIn = selectIsLoggedIn(state);
  const currentServer = selectCurrentServer(state);

  // 同时发起本地和远程请求
  const localPromise = browserDb.get(id);
  const remotePromise = noloReadRequest(
    currentServer,
    id,
    isLoggedIn ? token : undefined
  )
    .then(async (res) => {
      if (res.status === 200) {
        return await res.json();
      }
      console.warn(`Remote fetch failed with status ${res.status}`);
      return null;
    })
    .catch((err) => {
      console.error("Remote fetch error:", err);
      return null;
    });

  // 等待本地数据
  const localResult = await localPromise;

  // 如果本地有数据,先返回本地数据
  if (localResult) {
    // 后台继续处理远程数据
    remotePromise.then(async (remoteResult) => {
      if (!remoteResult) return;

      // 检查更新时间
      const shouldUpdate =
        remoteResult.updatedAt && localResult.updatedAt
          ? new Date(remoteResult.updatedAt) > new Date(localResult.updatedAt)
          : false;

      if (shouldUpdate) {
        await browserDb.put(id, remoteResult);
        toast.success("Data updated from server");
      }
    });

    return localResult;
  }

  // 本地没有数据,等待远程数据
  const remoteResult = await remotePromise;
  if (!remoteResult) {
    throw new Error("Failed to fetch data");
  }

  // 存储远程数据到本地
  await browserDb.put(id, remoteResult);
  return remoteResult;
};
