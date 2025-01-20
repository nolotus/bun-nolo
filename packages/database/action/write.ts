import { selectCurrentUserId } from "auth/authSlice";
import { API_ENDPOINTS } from "database/config";
import { selectCurrentWorkSpaceId } from "create/workspace/workspaceSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { DataType } from "create/types";
import { browserDb } from "../browser/db";
import { toast } from "react-hot-toast";
import pino from "pino";

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

const CYBOT_SERVER = "https://cybot.one";

const normalizeTimeFields = (data: Record<string, any>) => ({
  ...data,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  updated_at: undefined,
  created_at: undefined,
});

const noloRequest = async (server: string, config, state: any) => {
  logger.debug({ server, url: config.url }, "Making request to server");

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
  logger.info({ server, userId, customId }, "Starting write request");

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

    if (!response.ok) {
      logger.error({ status: response.status }, "Write request failed");
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    logger.info({ server }, "Write request successful");
    return response;
  } catch (error) {
    logger.error({ error, server }, "Failed to write to server");
    return null;
  }
};

export const writeAction = async (writeConfig, thunkApi) => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);
  const currentUserId = selectCurrentUserId(state);
  const userId = writeConfig.userId || currentUserId;
  const { data, customId } = writeConfig;

  logger.info(
    {
      dataType: data.type,
      customId,
      currentServer,
    },
    "Starting write action"
  );

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

    try {
      await browserDb.put(customId, willSaveData);
      logger.info({ customId }, "Data saved locally");

      const writePromises = [
        noloWriteRequest(currentServer, serverWriteConfig, state).then(
          (result) => {
            if (!result) {
              logger.error("Failed to save to default server");
              toast.error("Failed to save to default server");
            }
          }
        ),
      ];

      if (currentServer !== CYBOT_SERVER) {
        writePromises.push(
          noloWriteRequest(CYBOT_SERVER, serverWriteConfig, state).then(
            (result) => {
              if (!result) {
                logger.error("Failed to save to cybot.one");
                toast.error("Failed to save to cybot.one");
              }
            }
          )
        );
      }

      await Promise.all(writePromises);
      logger.info("All write operations completed");

      return willSaveData;
    } catch (error) {
      logger.error({ error }, "Write action failed");
      throw error;
    }
  }

  logger.warn({ dataType: data.type }, "Unsupported data type");
  return null;
};
