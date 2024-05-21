import { API_ENDPOINTS } from "database/config";
import { ulid } from "ulid";
import { noloRequest } from "utils/noloRequest";
import { NoloRootState } from "app/store";
import { Flags } from "core/prefix";

export const noloWriteRequest = async (state: NoloRootState, writeConfig) => {
  const { userId, data, flags, id } = writeConfig;
  // const userId = selectCurrentUserId(state);
  const customId = id ? id : ulid();
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
