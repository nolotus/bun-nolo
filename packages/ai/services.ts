import { api } from 'app/api'; // 确保路径正确
import { API_ENDPOINTS } from 'database/config';

import { createContent } from './client/createContent';
import { readChunks } from './client/stream';
const chatUrl = `${API_ENDPOINTS.AI}/chat`;
const addPrefixForEnv = (url: string) => {
  return process.env.NODE_ENV === 'production' ? url : `http://localhost${url}`;
};

export const aiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // 其他endpoints保持不变
    generateAudio: builder.mutation({
      query: (content) => ({
        url: `${API_ENDPOINTS.AI}/audio/speech`,
        method: 'POST',
        body: {
          model: 'tts-1',
          input: content,
          voice: 'alloy',
        },
      }),
    }),

    streamChat: builder.mutation({
      queryFn: async (
        { payload, config, onStreamData },
        { signal, getState },
        extraOptions,
        baseQuery,
      ) => {
        console.log('payload', payload);
        console.log('config', config);
        const createStreamRequestBody = (payload: any, config: any) => {
          const model = config.model || 'gpt-3.5-turbo-16k';
          const content = createContent(config);
          const { userMessage, prevMessages } = payload;

          return {
            type: 'stream',
            model,
            messages: [
              { role: 'system', content },
              ...prevMessages,
              { role: 'user', content: userMessage },
            ],
            temperature: config.temperature || 0.8,
            max_tokens: config.max_tokens || 1024,
            top_p: config.top_p || 0.9,
            frequency_penalty: config.frequency_penalty || 0,
            presence_penalty: config.presence_penalty || 0,
            stream: true, // 指定为流请求
          };
        };

        const requestBody = createStreamRequestBody(payload, {
          ...config,
          responseLanguage: navigator.language,
        });

        const url = addPrefixForEnv(chatUrl);
        const token = getState().user.currentToken;
        const headers = {
          'Content-Type': 'application/json',
          // 如果 token 存在，则添加到 headers
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        try {
          const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            signal,
            headers,
          });
          if (!response.ok) {
            // 处理错误
            return {
              error: { status: response.status, data: await response.text() },
            };
          }

          const reader = response.body.getReader();
          console.log('reader', reader);

          await readChunks(reader, onStreamData);
        } catch (error) {
          // 处理错误
          return { error: { status: 'FETCH_ERROR', data: error.message } };
        }
      },
    }),
  }),
});

export const { useGenerateAudioMutation, useStreamChatMutation } = aiApi;
