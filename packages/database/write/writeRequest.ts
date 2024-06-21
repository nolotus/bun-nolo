import { API_ENDPOINTS } from "database/config";
import { noloRequest } from "utils/noloRequest";
import { NoloRootState } from "app/store";
import { WriteConfigServer } from "./type";

export const noloWriteRequest = async (
  state: NoloRootState,
  writeConfig: WriteConfigServer,
) => {
  const { userId, data, flags, customId } = writeConfig;
  // const userId = selectCurrentUserId(state);

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
