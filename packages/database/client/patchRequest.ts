import { getLogger } from "utils/logger";
import { noloRequest } from "utils/noloRequest";

import { API_ENDPOINTS } from "../config";

const updateLogger = getLogger("update");

export const noloPatchRequest = async (state, id: string, changes) => {
  const config = {
    url: `${API_ENDPOINTS.DATABASE}/patch/${id}`,
    method: "PATCH",
    body: JSON.stringify(changes),
  };
  const response = await noloRequest(state, config);
  if (!response.ok) {
    updateLogger.error({ status: response.status }, "HTTP error");
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};
