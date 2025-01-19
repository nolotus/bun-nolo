import { selectCurrentUserId } from "auth/authSlice";
import { API_ENDPOINTS } from "database/config";
import { selectCurrentWorkSpaceId } from "create/workspace/workspaceSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { DataType } from "create/types";
import { browserDb } from "../browser/db";
import { toast } from "react-hot-toast";

const CYBOT_SERVER = "https://cybot.one";

const normalizeTimeFields = (data: Record<string, any>) => ({
  ...data,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  updated_at: undefined,
  created_at: undefined,
});

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

const noloWriteRequest = async (
  server: string,
  { userId, data, customId },
  state: any
) => {
  try {
    const response = await noloRequest(
      server,
      {
        url: `${API_ENDPOINTS.DATABASE}/write/`,
        method: "POST",
        body: JSON.stringify({ data, customId, userId }),
      },
      state
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    console.log(`Write to ${server} successful`);
    return response;
  } catch (error) {
    console.error(`Failed to write to ${server}:`, error);
    return null;
  }
};

export const writeAction = async (writeConfig, thunkApi) => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);
  const currentUserId = selectCurrentUserId(state);
  // Support writing to other user's space, fallback to current user if not specified
  const userId = writeConfig.userId || currentUserId;
  const { data, customId } = writeConfig;

  if (
    [
      DataType.MSG,
      DataType.CYBOT,
      DataType.PAGE,
      DataType.DIALOG,
      DataType.TOKEN,
    ].includes(data.type)
  ) {
    const willSaveData = normalizeTimeFields({
      ...data,
      id: customId,
      userId: currentUserId,
    });

    const serverWriteConfig = { ...writeConfig, data: willSaveData, userId };

    await browserDb.put(customId, willSaveData);
    console.log("Data saved locally");

    const writePromises = [
      noloWriteRequest(currentServer, serverWriteConfig, state).then(
        (result) => !result && toast.error("Failed to save to default server")
      ),
    ];

    if (currentServer !== CYBOT_SERVER) {
      writePromises.push(
        noloWriteRequest(CYBOT_SERVER, serverWriteConfig, state).then(
          (result) => !result && toast.error("Failed to save to cybot.one")
        )
      );
    }

    Promise.all(writePromises).catch(console.error);

    return willSaveData;
  }
};
