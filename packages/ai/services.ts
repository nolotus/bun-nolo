import { api } from 'app/api'; // 确保路径正确

export const aiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    generateAudio: builder.mutation({
      query: (content) => ({
        url: 'ai/audio/speech',
        method: 'POST',
        body: {
          model: 'tts-1',
          input: content,
          voice: 'alloy',
        },
      }),
    }),
  }),
});

export const { useGenerateAudioMutation } = aiApi;
