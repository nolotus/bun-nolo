import { extractAndDecodePrefix, extractCustomId } from 'core';
import { getLogger } from 'utils/logger';

import { sendWriteRequest } from './request';
const dataImportLogger = getLogger('data-import');

export const importData = async (id, data) => {
  const flags = extractAndDecodePrefix(id);
  const customId = extractCustomId(id);

  try {
    const requestData = { data, flags, customId };
    const responseData = await sendWriteRequest(requestData);
    dataImportLogger.info({ responseData }, 'Data imported successfully');
    return responseData;
  } catch (error) {
    dataImportLogger.error('Error:', error);
    throw error;
  }
};
