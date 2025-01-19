import { selectCurrentServer } from "setting/settingSlice";
import { API_ENDPOINTS } from "../config";
import { browserDb } from "database/browser/db";
import { toast } from "react-hot-toast";

const CYBOT_SERVER = "https://cybot.one";

const noloRequest = async (server: string, config, state: any) => {
  const headers = {
    "Content-Type": "application/json",
    ...(state.auth?.currentToken && {
      Authorization: `Bearer ${state.auth.currentToken}`,
    }),
  };

  return fetch(server + config.url, {
    method: config.method || "GET",
    headers,
    body: config.body,
  });
};

const noloDeleteRequest = async (server: string, id: string, state: any) => {
  try {
    const response = await noloRequest(
      server,
      {
        url: `${API_ENDPOINTS.DATABASE}/delete/${id}`,
        method: "DELETE",
      },
      state
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    console.log(`Delete from ${server} successful`);
    return response;
  } catch (error) {
    console.error(`Failed to delete from ${server}:`, error);
    return null;
  }
};

export const deleteAction = async (id: string, thunkApi) => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);

  // 本地删除
  await browserDb.del(id);
  console.log("Data deleted locally");

  // 后台删除远程数据
  const deletePromises = [
    noloDeleteRequest(currentServer, id, state).then(
      (result) => !result && toast.error("Failed to delete from default server")
    ),
  ];

  // 如果默认服务器不是cybot.one，也从cybot.one删除
  if (currentServer !== CYBOT_SERVER) {
    deletePromises.push(
      noloDeleteRequest(CYBOT_SERVER, id, state).then(
        (result) => !result && toast.error("Failed to delete from cybot.one")
      )
    );
  }

  Promise.all(deletePromises).catch(console.error);

  return { id };
};
