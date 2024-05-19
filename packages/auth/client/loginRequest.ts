import { NoloRootState } from "app/store";
import { API_VERSION } from "database/config";
import { selectCurrentServer } from "setting/settingSlice";
import { isProduction } from "utils/env";
export const loginRequest = (state: NoloRootState, data) => {
  let currentServer = selectCurrentServer(state);
  if (!isProduction) {
    currentServer = "http://localhost";
  }
  const url = `${currentServer}${API_VERSION}/users/login`;
  const body = JSON.stringify(data);
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
};
