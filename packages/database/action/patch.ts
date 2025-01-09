import { isV0Id } from "core/id";
import { browserDb } from "../browser/db";
import { API_ENDPOINTS } from "../config";
import { selectCurrentServer } from "setting/settingSlice";
import { deleteData, selectById, write } from "../dbSlice";
import { DataType } from "create/types";
import { isProduction } from "utils/env";
import { pipe } from "rambda";

const makeRequest = async (state, { url, method = "GET", body }) => {
  const headers = {
    "Content-Type": "application/json",
    ...(state.auth && { Authorization: `Bearer ${state.auth.currentToken}` }),
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

export const patchAction = async ({ id, changes }, thunkApi) => {
  const state = thunkApi.getState();
  const timestamp = Date.now();

  // 准备更新数据
  const updatedChanges = {
    ...changes,
    updatedAt: timestamp,
  };

  // 使用 pipe 让数据流更清晰
  return pipe(
    // 1. 读取本地数据并合并
    async () => {
      const local = await browserDb.get(id);
      return {
        ...local,
        ...updatedChanges,
      };
    },
    // 2. 同时处理远程和本地更新
    async (newData) => {
      await Promise.all([
        makeRequest(state, {
          url: `${API_ENDPOINTS.DATABASE}/patch/${id}`,
          method: "PATCH",
          body: JSON.stringify(updatedChanges),
        }),
        browserDb.put(id, newData),
      ]);
      return newData;
    }
  )();
};
