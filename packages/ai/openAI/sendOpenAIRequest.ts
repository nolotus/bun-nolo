import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

import { createOpenAIRequestConfig } from '../openAI/config';
import { FrontEndRequestBody } from '../types';

const sendOpenAIRequest = async (
  requestBody: FrontEndRequestBody,
): Promise<AxiosResponse<any> | null> => {
  const data = {
    model: requestBody.model,
    messages: requestBody.messages,
    stream: true,
  };

  const config: AxiosRequestConfig = {
    ...createOpenAIRequestConfig(),
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    responseType: 'stream',
    data,
  };

  try {
    const response = await axios.request(config);
    return response;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

export default sendOpenAIRequest;
