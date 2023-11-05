import { fetchWithToken, buildURL } from 'app/request';
import { getLogger } from 'utils/logger';

import { API_ENDPOINTS } from '../config';

const TIMEOUT = 3000;
const readLogger = getLogger('read');

const fetchReadAllData = async (domain, userId) => {
  const url = buildURL(domain, API_ENDPOINTS.READ_ALL);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), TIMEOUT),
  );

  try {
    const fetchPromise = fetchWithToken(url, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    const parsedData = await Promise.race([fetchPromise, timeoutPromise]);
    readLogger.info(`Data from ${url}:`, parsedData);
    return parsedData;
  } catch (error) {
    readLogger.error(`Error fetching data from ${url}:`, error);
    return null;
  }
};

export default fetchReadAllData;
