import { API_ENDPOINTS } from "database/config";
import { noloRequest } from "utils/noloRequest";
import { NoloRootState } from "app/store";

export const noloQueryRequest = async (
  state: NoloRootState,
  queryConfig: any,
) => {
  const { queryUserId, options } = queryConfig;
  const body = JSON.stringify(options.condition);
  const queryParams = new URLSearchParams({
    isObject: (options.isObject ?? false).toString(),
    isJSON: (options.isJSON ?? false).toString(),
    limit: options.limit?.toString() ?? "",
  });
  const url = `${API_ENDPOINTS.DATABASE}/query/${queryUserId}?${queryParams}`;
  const fetchConfig = {
    url,
    method: "POST",
    body,
  };
  return await noloRequest(state, fetchConfig);
};
