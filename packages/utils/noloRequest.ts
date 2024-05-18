import { selectCurrentServer } from "setting/settingSlice";

export const noloRequest = async (state, fetchConfig) => {
  const token = state.auth.currentToken;
  const currentServer = selectCurrentServer(state);

  const dynamicUrl = currentServer + fetchConfig.url;
  const method = fetchConfig.method ? fetchConfig.method : "GET";
  const body = fetchConfig.body;
  return fetch(dynamicUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });
};
