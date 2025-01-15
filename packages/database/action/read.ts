import { selectCurrentServer } from "setting/settingSlice";
import { selectIsLoggedIn } from "auth/authSlice";
import { isV0Id } from "core/id";
import { API_ENDPOINTS } from "database/config";

import { browserDb } from "../browser/db";

const noloReadRequest = async (server: string, id: string, token?: string) => {
  const url = `${API_ENDPOINTS.DATABASE}/read/${id}`;
  let headers = {
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
  const isLoggedIn = selectIsLoggedIn(state);
  const token = state.auth.currentToken;

  if (!isV0Id(id)) {
    const result = await browserDb.get(id);
    return result;
  } else {
    const currentServer = selectCurrentServer(state);
    if (isLoggedIn) {
      const res = await noloReadRequest(currentServer, id, token);
      if (res.status === 200) {
        const result = await res.json();
        return result;
      } else {
        throw new Error(`Request failed with status code ${res.status}`);
      }
    }
  }
};
