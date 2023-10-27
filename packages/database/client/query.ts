import { API_ENDPOINTS } from "../config";
import { QueryOptions } from "../query/types";

export const queryData = async (userId: string, options: QueryOptions) => {
  const url = `${API_ENDPOINTS.DATABASE}/query/${userId}`;

  const queryParams = new URLSearchParams({
    isObject: options.isObject ? "true" : "false",
    isJSON: options.isJSON ? "true" : "false",
    limit: options.limit,
  });

  const response = await fetch(`${url}?${queryParams}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options.condition),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error querying data");
  }

  return await response.json();
};
