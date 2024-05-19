import { selectCurrentServer } from "setting/settingSlice";

export const noloRequest = async (state, fetchConfig) => {
  const currentServer = selectCurrentServer(state);
  const dynamicUrl = currentServer + fetchConfig.url;
  const method = fetchConfig.method ? fetchConfig.method : "GET";
  const body = fetchConfig.body;
  let headers = {
    "Content-Type": "application/json",
  };

  if (state.auth) {
    const token = state.auth.currentToken;
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(dynamicUrl, {
    method,
    headers,
    body,
  });
};
