import { API_ENDPOINTS } from "database/config";
import { ulid } from "ulid";
import { noloRequest } from "utils/noloRequest";
import { selectCurrentUserId } from "auth/selectors";
import { NoloRootState } from "app/store";

export const noloWriteRequest = async (
  state: NoloRootState,
  data: any,
  id: string,
) => {
  const userId = selectCurrentUserId(state);
  const customId = id ? id : ulid();
  const fetchConfig = {
    url: `${API_ENDPOINTS.DATABASE}/write/`,
    method: "POST",
    body: JSON.stringify({
      data,
      flags: { isJSON: true },
      customId,
      userId,
    }),
  };
  return await noloRequest(state, fetchConfig);
};
