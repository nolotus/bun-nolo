import { API_ENDPOINTS } from "database/config";
import { ulid } from "ulid";
import { noloRequest } from "utils/noloRequest";
import { selectCurrentUserId } from "auth/selectors";
import { NoloRootState } from "app/store";
import { Flags } from "core/prefix";

export const noloWriteRequest = async (
  state: NoloRootState,
  data: any,
  flags: Flags,
  id?: string,
) => {
  const userId = selectCurrentUserId(state);
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
