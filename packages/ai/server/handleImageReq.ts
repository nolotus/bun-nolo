import axios, {AxiosRequestConfig} from 'axios';
import {getLogger} from 'utils/logger';

import {getProxyAxiosConfig} from './proxyUtils';
import {getOpenAIHeaders} from './openAIConfig';

interface ImageRequestBody {
  prompt: string;
  n: number;
  size: string;
}

const openAiLogger = getLogger('OpenAI');

export const handleImageReq = async (req: any, res: any) => {
  const requestBody: ImageRequestBody = req.body;
  const openAIHeaders = getOpenAIHeaders();
  const proxyConfig = getProxyAxiosConfig();
  openAiLogger.info({requestBody}, 'Handling image request');

  const apiUrl = 'https://api.openai.com/v1/images/generations';

  const config: AxiosRequestConfig = {
    ...proxyConfig,
    headers: openAIHeaders,
    method: 'POST',
    url: apiUrl,
    data: {
      prompt: requestBody.prompt || '',
      n: requestBody.n || 1,
      size: requestBody.size || '1024x1024',
    },
  };

  try {
    const response = await axios.request(config);
    res.json(response.data);
  } catch (error) {
    openAiLogger.error('Error during OpenAI API request: %s', error.message);
  }
};
