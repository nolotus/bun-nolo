import { isV0Id } from "core/id";
import { browserDb } from "../browser/db";
import { API_ENDPOINTS } from "../config";
import { selectCurrentServer } from "setting/settingSlice";
import { deleteData, selectById, write } from "../dbSlice";
import { DataType } from "create/types";
import { isProduction } from "utils/env";

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
  const dispatch = thunkApi.dispatch;
  const updatedAt = new Date().toISOString(); // 添加更新时间戳

  const updatedChanges = {
    ...changes,
    updatedAt, // 将更新时间添加到changes中
  };

  // 本地存储更新
  if (!isV0Id(id)) {
    // 远程请求
    const local = await browserDb.get(id);

    const newData = {
      ...local,
      ...updatedChanges,
    };
    makeRequest(state, {
      url: `${API_ENDPOINTS.DATABASE}/patch/${id}`,
      method: "PATCH",
      body: JSON.stringify(updatedChanges),
    });
    await browserDb.put(id, newData);
    return newData;
  }
  if (isV0Id(id)) {
    const memData = selectById(state, id);
    const newData = {
      ...memData,
      ...updatedChanges,
    };

    dispatch(write({ data: newData }));
    if (memData.type === DataType.DIALOG) {
      // isProduction && dispatch(deleteData(id));
    }
    return newData;
  }
};
