import { retrieveFirstToken } from 'auth/client/token';

import { API_ENDPOINTS } from '../config';

export const deleteData = async (dataKey: string) => {
  try {
    const token = retrieveFirstToken();
    if (!token) {
      window.location.href = '/';
      throw new Error('No token found');
    }

    const response = await fetch(`${API_ENDPOINTS.DATABASE}delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dataKey }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
