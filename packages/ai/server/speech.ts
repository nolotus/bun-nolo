import axios from 'axios';
import { createResponse } from 'server/createResponse';

import { getOpenAIHeaders } from './openAIConfig';

export const handleAudioSpeechRequest = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const requestBody = req.body; // Use req.body directly

      const openAIHeaders = getOpenAIHeaders();
      const requestData = {
        model: requestBody.model,
        input: requestBody.input,
        voice: requestBody.voice,
      };

      const config = {
        headers: openAIHeaders,
        responseType: 'arraybuffer', // get the response as a binary buffer
      };

      const openAIResponse = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        requestData,
        config,
      );
      const uint8Array = new Uint8Array(openAIResponse.data);
      const response = new Response(uint8Array, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'audio/mpeg',
        },
      });
      return response;
    } catch (error) {}
  } else {
    const methodNotAllowedResponse = createResponse();
    methodNotAllowedResponse.status(405);
    methodNotAllowedResponse.json({ message: 'Method Not Allowed' });
    return methodNotAllowedResponse;
  }
};
