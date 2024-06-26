import { api } from "app/api";
import { API_ENDPOINTS } from "database/config";

export const aiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    visionChat: builder.mutation({
      query: (payload) => ({
        url: `${API_ENDPOINTS.AI}/chat`,
        method: "POST",
        body: payload, // 直接使用 payload 作为请求体
      }),
    }),
    generateImageEdit: builder.mutation({
      query: (payload) => ({
        url: `${API_ENDPOINTS.AI}/images/edits`,
        method: "POST",
        body: payload, // 直接使用 payload 作为请求体
      }),
    }),

    generateImageVariation: builder.mutation({
      query: (payload) => ({
        url: `${API_ENDPOINTS.AI}/images/variations`,
        method: "POST",
        body: payload, // 直接使用 payload 作为请求体
      }),
    }),

    generateAudio: builder.mutation({
      query: (content: string) => ({
        url: `${API_ENDPOINTS.AI}/audio/speech`,
        method: "POST",
        body: {
          model: "tts-1",
          input: content,
          voice: "alloy",
        },
      }),
    }),
  }),
});

export const {
  useGenerateAudioMutation,
  useGenerateImageEditMutation,
  useGenerateImageVariationMutation,
} = aiApi;
