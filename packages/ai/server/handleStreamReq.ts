import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { createResponse } from 'server/createResponse';

import { FrontEndRequestBody } from '../types';

import { getOpenAIHeaders } from './openAIConfig';
import { getProxyAxiosConfig } from './proxyUtils';

const handleStreamEvents = (stream: AxiosResponse<any>) => {
  if (stream && stream.data) {
    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      start(controller) {
        stream.data.on('data', (chunk) => {
          controller.enqueue(textEncoder.encode(chunk.toString()));
        });
        stream.data.on('end', () => {
          controller.close();
        });
      },
    });

    const responseHeaders = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    };
    const response = new Response(readableStream, { headers: responseHeaders });
    return response;
  }
  return null;
};
export const handleStreamReq = async (req: Request, res) => {
  const openAIHeaders = getOpenAIHeaders();
  const proxyConfig = getProxyAxiosConfig();

  const requestBody: FrontEndRequestBody = req.body;

  const config: AxiosRequestConfig = {
    ...proxyConfig,
    headers: openAIHeaders,
    method: 'POST',
    responseType: 'stream',
    url: 'https://api.openai.com/v1/chat/completions',
    data: {
      model: requestBody.model,
      messages: requestBody.messages,
      stream: true,
    },
  };

  try {
    const response = await axios.request(config);
    let res = createResponse();

    return handleStreamEvents(response, res);
  } catch (error) {
    console.log(error.message);
  }
};
