import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { createOpenAIRequestConfig } from '../openAI/config';
import { Message, RequestPayloadProperties } from '../types';

type RequestPayload = RequestPayloadProperties & {
  messages: Message[],
};

function createRequestConfig(
  requestPayload: RequestPayload,
  authorization: string,
): AxiosRequestConfig {
  const data = {
    ...requestPayload,
    stream: true,
  };

  const commonConfig = createOpenAIRequestConfig();
  return {
    ...commonConfig,
    url: 'https://api.perplexity.ai/chat/completions',
    method: 'POST',
    responseType: 'stream',
    headers: {
      ...commonConfig.headers,
      Authorization: authorization,
    },
    data,
  };
}

export async function sendPerplexityRequest(
  requestPayload: RequestPayload,
): Promise<AxiosResponse<any>> {
  const authorization = `Bearer ${process.env.PERPLEXITY_AI_TOKEN}`;
  const config = createRequestConfig(requestPayload, authorization);
  try {
    const response: AxiosResponse<any> = await axios.request(config);
    return response;
  } catch (error) {
    console.error('Error making the request:', error.message);
    throw error;
  }
}
