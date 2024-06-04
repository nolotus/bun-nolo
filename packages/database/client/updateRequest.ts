import { extractAndDecodePrefix, extractUserId } from "core";
import { formatData } from "core/formatData";
import { getLogger } from "utils/logger";

import { API_ENDPOINTS } from "../config";
import { noloRequest } from "utils/noloRequest";

const updateLogger = getLogger("update");

export const noloUpdateRequest = async (state, id, data) => {
  const config = {
    url: `${API_ENDPOINTS.DATABASE}/update/${id}`,
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

export const updateData = async (userId, data, id) => {
  try {
    const dataBelongUserId = extractUserId(id);
    const flags = extractAndDecodePrefix(id);
    updateLogger.info(
      { dataUserId: dataBelongUserId, userId },
      "Formatted data for user",
    );

    if (
      dataBelongUserId === userId ||
      (flags.isOthersWritable && data.writeableIds.includes(userId))
    ) {
      const formattedData = {
        data: formatData(data, flags),
        flags,
        id,
      };

      updateLogger.info(
        { formattedData },
        dataBelongUserId === userId
          ? "Formatted data for user"
          : "Formatted data for other writable users",
      );

      return await update(formattedData, id, token);
    }
  } catch (error) {
    updateLogger.error({ error }, "Error in updateData");
    throw error;
  }
};
