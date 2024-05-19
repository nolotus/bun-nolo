import { API_ENDPOINTS } from "database/config";
import { noloRequest } from "utils/noloRequest";
import { NoloRootState } from "app/store";

export const noloQueryRequest = async (
  queryUserID: string,
  state: NoloRootState,
  queryParams: URLSearchParams,
  body: string,
) => {
  const url = `${API_ENDPOINTS.DATABASE}/query/${queryUserID}?${queryParams}`;
  const fetchConfig = {
    url,
    method: "POST",
    body,
  };
  return await noloRequest(state, fetchConfig);
};
