import { selectCurrentUserId } from "auth/authSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { DataType } from "create/types";
import { browserDb } from "../browser/db";
import { toast } from "react-hot-toast";
import { noloWriteRequest } from "../requests";

const CYBOT_SERVERS = {
  ONE: "https://cybot.one",
  RUN: "https://cybot.run",
};

const TIMEOUT = 5000;

const syncWithServers = (servers, writeConfig, state) => {
  servers.forEach((server) => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT);

    noloWriteRequest(server, writeConfig, state, abortController.signal)
      .then((success) => {
        clearTimeout(timeoutId);
        if (!success) toast.error(`Failed to save to ${server}`);
      })
      .catch(() => clearTimeout(timeoutId));
  });
};

const normalizeTimeFields = (data) => ({
  ...data,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  updated_at: undefined,
  created_at: undefined,
});

export const writeAction = async (writeConfig, thunkApi) => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);
  const currentUserId = selectCurrentUserId(state);
  const { data, customId } = writeConfig;
  const userId = writeConfig.userId || currentUserId;

  if (
    ![
      DataType.MSG,
      DataType.CYBOT,
      DataType.PAGE,
      DataType.DIALOG,
      DataType.TOKEN,
      DataType.TRANSACTION,
    ].includes(data.type)
  ) {
    return null;
  }

  try {
    const willSaveData = normalizeTimeFields({
      ...data,
      id: customId,
      userId: currentUserId,
    });

    await browserDb.put(customId, willSaveData);

    const servers = Array.from(
      new Set([currentServer, CYBOT_SERVERS.ONE, CYBOT_SERVERS.RUN])
    );
    const serverWriteConfig = { ...writeConfig, data: willSaveData, userId };

    Promise.resolve().then(() =>
      syncWithServers(servers, serverWriteConfig, state)
    );

    return willSaveData;
  } catch (error) {
    throw error;
  }
};
