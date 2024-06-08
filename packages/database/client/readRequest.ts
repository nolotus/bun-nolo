import { API_ENDPOINTS } from "database/config";
import { noloRequest } from "utils/noloRequest";
// import { selectCurrentUserId } from "auth/selectors";
import { NoloRootState } from "app/store";

export const noloReadRequest = async (state: NoloRootState, id: string) => {
  // const userId = selectCurrentUserId(state);
  const fetchConfig = {
    url: `${API_ENDPOINTS.DATABASE}/read/${id}`,
    method: "GET",
  };
  return await noloRequest(state, fetchConfig);
};
