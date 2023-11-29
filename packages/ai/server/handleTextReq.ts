import { getLogger } from 'utils/logger';

import { getOpenAIHeaders } from '../openAI/config';

const apiLogger = getLogger('api');

export const handleTextReq = async (req, res) => {
  apiLogger.info('Handling text request');

  const requestBody = req.body;
  const openAIHeaders = getOpenAIHeaders();

  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  apiLogger.info(
    { requestBody, openAIHeaders },
    'Sending request to OpenAI API',
  );

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: openAIHeaders,
    body: JSON.stringify({
      model: requestBody.model || 'gpt-3.5-turbo-16k',
      messages: requestBody.messages || [],
    }),
  });

  if (!response.ok) {
    apiLogger.error(`Failed to fetch from OpenAI: ${response.statusText}`);
    throw new Error(`Failed to fetch from OpenAI: ${response.statusText}`);
  }

  const responseData = await response.json();
  apiLogger.info({ responseData }, 'Received response from OpenAI API');

  return res.json(responseData);
};
