import { noloRequest } from "utils/noloRequest";

import { API_ENDPOINTS } from "../config";

export const noloPutRequest = async (state, id, data) => {
  const config = {
    url: `${API_ENDPOINTS.DATABASE}/put/${id}`,
    method: "PUT",
    body: JSON.stringify(data),
  };
  const response = await noloRequest(state, config);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};
