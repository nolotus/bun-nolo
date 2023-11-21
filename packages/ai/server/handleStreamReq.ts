import axios, { AxiosResponse } from 'axios';

import { FrontEndRequestBody } from '../types';

import { createOpenAIRequestConfig } from './openAIConfig';

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
  const requestBody: FrontEndRequestBody = req.body;
  //must same with the openai api schema , or it will return 400
  const sanitizedMessages = requestBody.messages.map((message) => {
    const { id, ...rest } = message;
    return rest;
  });
  const config = createOpenAIRequestConfig();
  try {
    const response = await axios.request({
      ...config,
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      responseType: 'stream',
      data: {
        model: requestBody.model,
        messages: sanitizedMessages,
        stream: true,
      },
    });
    return handleStreamEvents(response);
  } catch (error) {
    console.log(error.message);
  }
};
