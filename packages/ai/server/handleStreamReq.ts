import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { FrontEndRequestBody } from '../types';

import { getOpenAIHeaders } from './openAIConfig';

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
const useProxy = process.env.USE_PROXY === 'true'; // Check if USE_PROXY is set to true

export const handleStreamReq = async (req: Request, res) => {
  const openAIHeaders = getOpenAIHeaders();

  const requestBody: FrontEndRequestBody = req.body;
  //must same with the openai api schema , or it will return 400
  const sanitizedMessages = requestBody.messages.map((message) => {
    const { id, ...rest } = message;
    return rest;
  });
  const config: AxiosRequestConfig = {
    ...(useProxy && {
      // If useProxy is true, add the proxy configuration
      proxy: {
        protocol: 'http',
        host: '127.0.0.1',
        port: 10080,
      },
    }),
    headers: openAIHeaders,
    method: 'POST',
    responseType: 'stream',
    url: 'https://api.openai.com/v1/chat/completions',
    data: {
      model: requestBody.model,
      messages: sanitizedMessages,
      stream: true,
    },
  };
  try {
    const response = await axios.request(config);

    return handleStreamEvents(response);
  } catch (error) {
    console.log(error.message);
  }
};
