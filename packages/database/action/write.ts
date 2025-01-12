import { selectCurrentUserId } from "auth/authSlice";
import { API_ENDPOINTS } from "database/config";
import { selectCurrentWorkSpaceId } from "create/workspace/workspaceSlice";

import { DataType } from "create/types";
import { browserDb } from "../browser/db";
import { noloRequest } from "../requests/noloRequest";
interface WriteConfigServer {
  customId: string;
  data: Record<string, any>;
  userId: string;
}

const noloWriteRequest = async (state: any, writeConfig: WriteConfigServer) => {
  const { userId, data, flags, customId } = writeConfig;

  const fetchConfig = {
    url: `${API_ENDPOINTS.DATABASE}/write/`,
    method: "POST",
    body: JSON.stringify({
      data,
      flags,
      customId,
      userId,
    }),
  };
  return await noloRequest(state, fetchConfig);
};

//data flagas userId id
export const writeAction = async (writeConfig, thunkApi) => {
  const state = thunkApi.getState();
  const currenUserId = selectCurrentUserId(state);
  //todo write
  const workspaceId = selectCurrentWorkSpaceId(state);
  let userId = currenUserId;
  if (writeConfig.userId) {
    userId = writeConfig.userId;
  }
  const { data } = writeConfig;

  if (
    data.type === DataType.MSG ||
    data.type === DataType.CYBOT ||
    data.type === DataType.PAGE ||
    data.type === DataType.DIALOG
  ) {
    const willSaveData = {
      ...data,
      createdAt: new Date().toISOString(),
    };

    const serverWriteConfig = {
      ...writeConfig,
      data: willSaveData,
      customId: writeConfig.customId,
    };

    noloWriteRequest(state, serverWriteConfig);
    await browserDb.put(writeConfig.customId, willSaveData);
    return willSaveData;
  }
};
