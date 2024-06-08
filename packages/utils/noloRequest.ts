import { selectCurrentServer } from "setting/settingSlice";

//handle currentServer and token
export const noloRequest = async (state, config) => {
  const currentServer = selectCurrentServer(state);
  const dynamicUrl = currentServer + config.url;
  const method = config.method ? config.method : "GET";
  const body = config.body;
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
