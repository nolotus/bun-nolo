import {API_ENDPOINTS} from 'database/config';
import {fetchWithToken} from 'app/request';
import {formatData} from 'core/formatData';
import {WriteDataRequestBody} from '../types';

export const prepareRequestData = (
  data,
  flags,
  customId,
): WriteDataRequestBody => {
  return {
    data: formatData(data, flags),
    flags,
    customId,
  };
};

export const sendWriteRequest = async requestData => {
  const url = `${API_ENDPOINTS.DATABASE}/write`;
  const options = {
    method: 'POST',
    body: JSON.stringify(requestData),
  };

  try {
    const response = await fetchWithToken(url, options, true);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
