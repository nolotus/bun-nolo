import { API_ENDPOINTS } from "database/config";

export const noloQueryRequest = async (queryConfig: any) => {
  const { server } = queryConfig;
  const { queryUserId, options } = queryConfig;

  const queryParams = new URLSearchParams({
    isObject: (options.isObject ?? false).toString(),
    isJSON: (options.isJSON ?? false).toString(),
    limit: options.limit?.toString() ?? "",
  });
  const url = `${API_ENDPOINTS.DATABASE}/query/${queryUserId}?${queryParams}`;
  const fullUrl = server + url;
  let headers = {
    "Content-Type": "application/json",
  };
  const body = JSON.stringify(options.condition);
  return fetch(fullUrl, {
    method: "POST",
    headers,
    body,
  });
};
