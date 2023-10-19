import {API_VERSION}from 'database/config'
import {createRequestBody} from './common';
import {retrieveFirstToken} from 'auth/client/token';
import {getLogger} from 'utils/logger';
import {readChunks} from './stream';

const openAiLogger = getLogger('openAi');

const createHeaders = () => {
  const token = retrieveFirstToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const sendRequest = async (url, requestBody, headers) => {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  return await response.json();
};

export const sendRequestToOpenAI = async (
  type,
  payload,
  config,
  onStreamData?,
) => {
  if (!['stream', 'text', 'image'].includes(type)) {
    throw new Error('Invalid type specified');
  }

  const url = `${API_VERSION}/openai-proxy`;
  const responseLanguage = navigator.language;
  config.responseLanguage = responseLanguage;

  const requestBody = createRequestBody(type, payload, config);
  const headers = createHeaders();

  let timeoutId;

  try {
    const response = await Promise.race([
      fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      }),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Request timeout after 5 seconds'));
        }, 5000);
      }),
    ]);

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned an error: ${response.statusText}`);
    }

    if (type === 'stream') {
      const reader = response.body!.getReader();
      await readChunks(reader, onStreamData);
    } else {
      const data = await sendRequest(url, requestBody, headers);

      if (type === 'text') {
        return data.choices[0].message.content;
      } else if (type === 'image') {
        return data;
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    openAiLogger.error(error);
    throw error;
  }
};
