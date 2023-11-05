import { fetchWithToken, buildURL } from 'app/request';
import { API_ENDPOINTS } from 'database/config';

export const syncUserData = async (idDataMap, domain) => {
  const url = buildURL(domain, `${API_ENDPOINTS.USERS}/sync`);
  try {
    const payload = {
      idDataMap,
    };

    const response = await fetchWithToken(
      url,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      true,
    ); // 注意这里的 true，表示返回原始的 response 对象

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
