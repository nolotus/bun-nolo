import {API_ENDPOINTS} from 'database/config';

export const deleteUser = async (userId, domainPrefix = 'nolotus.com') => {
  const response = await fetch(
    `https:/${domainPrefix}${API_ENDPOINTS.USERS}/${userId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (response.ok) {
    const result = await response.json();
    return result;
  } else {
    const result = await response.json();
    throw new Error(result.message);
  }
};
