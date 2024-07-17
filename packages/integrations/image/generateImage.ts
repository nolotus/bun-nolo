import { API_ENDPOINTS } from "database/config";
import { retrieveFirstToken } from "auth/client/token";

async function generateImage(payload) {
  const token = retrieveFirstToken();
  const url = `${API_ENDPOINTS.AI}/images/generations`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 如有必要，请添加您的认证头
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export default generateImage;
