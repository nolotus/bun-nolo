import {API_ENDPOINTS} from 'database/config';
import {generateIdWithCustomId} from 'core/generateMainKey';
import {extractAndDecodePrefix, extractCustomId} from 'core/prefix';
import {getUserId, validateToken} from 'auth/client/token';
import {readData} from './read';
import {prepareRequestData} from './request';

const getSyncEndpoints = async () => {
  const userId = getUserId();
  const flags = {isJSON: true};
  const dataId = generateIdWithCustomId(userId, 'syncSettings', flags);
  console.log('dataId', dataId);

  const syncSettings = await readData(dataId);
  const result = syncSettings.serverAddress;
  console.log('resule', result);

  return result;
};

export const syncDataFromNolotus = async (id, data) => {
  const currentHost = window.location.origin; // 获取当前服务器的host
  await syncDataToEndpoint(
    `${currentHost}${API_ENDPOINTS.DATABASE}/write`,
    id,
    data,
  );
  console.log('Data synced from nolotus successfully');
};

export const syncData = async (id, data) => {
  const syncEndpoints = (await getSyncEndpoints()) || []; // 获取完整的远程endpoints，包括host
  const syncPromises = syncEndpoints.map(endpoint =>
    syncDataToEndpoint(`${endpoint}${API_ENDPOINTS.DATABASE}/write`, id, data),
  );

  try {
    await Promise.all(syncPromises);
    console.log('Data synced successfully');
  } catch (error) {
    console.error('Failed to sync data:', error);
  }
};

const syncDataToEndpoint = async (endpoint: string, id: string, data: any) => {
  const token = validateToken();
  const flags = extractAndDecodePrefix(id);
  const customId = extractCustomId(id);
  const requestData = prepareRequestData(data, flags, customId);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to sync data to ${endpoint}, status: ${response.status}`,
      );
    }

    console.log(`Data synced successfully to ${endpoint}`);
  } catch (error) {
    console.error(`Error syncing data to ${endpoint}:`, error);
    throw error;
  }
};
