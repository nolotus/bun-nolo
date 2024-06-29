import { getLogger } from "utils/logger";

import { API_ENDPOINTS } from "../config";
import { noloRequest } from "utils/noloRequest";

const updateLogger = getLogger("update");

export const noloPutRequest = async (state, id, data) => {
  const config = {
    url: `${API_ENDPOINTS.DATABASE}/put/${id}`,
    method: "PUT",
    body: JSON.stringify(data),
  };
  const response = await noloRequest(state, config);
  if (!response.ok) {
    updateLogger.error({ status: response.status }, "HTTP error");
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};
