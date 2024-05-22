import { retrieveFirstToken } from "auth/client/token";
import { extractAndDecodePrefix, extractUserId } from "core";
import { formatData } from "core/formatData";
import { getLogger } from "utils/logger";

import { API_ENDPOINTS } from "../config";

const updateLogger = getLogger("update");

const updateDatabase = async (formattedData, id, token) => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE}/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formattedData),
  });

  if (!response.ok) {
    updateLogger.error({ status: response.status }, "HTTP error");
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  updateLogger.info({ responseData }, "Response data");
  return responseData;
};

export const updateData = async (userId, data, id) => {
  try {
    const token = retrieveFirstToken();

    if (!token) {
      window.location.href = "/";
      updateLogger.error({ token }, "No token found");
      throw new Error("No token found");
    }

    const dataUserId = extractUserId(id);
    const flags = extractAndDecodePrefix(id);
    updateLogger.info({ dataUserId, userId }, "Formatted data for user");

    if (
      dataUserId === userId ||
      (flags.isOthersWritable && data.writeableIds.includes(userId))
    ) {
      const formattedData = {
        data: formatData(data, flags),
        flags,
        id,
      };

      updateLogger.info(
        { formattedData },
        dataUserId === userId
          ? "Formatted data for user"
          : "Formatted data for other writable users",
      );

      return await updateDatabase(formattedData, id, token);
    }
  } catch (error) {
    updateLogger.error({ error }, "Error in updateData");
    throw error;
  }
};
