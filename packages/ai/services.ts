import { api } from "app/api";
import { API_ENDPOINTS } from "database/config";

import { createPromotMessage } from "./utils/createPromotMessage";
import { readChunks } from "./client/stream";
import addPrefixForEnv from "utils/urlConfig";

const chatUrl = `${API_ENDPOINTS.AI}/chat`;

export const aiApi = api.injectEndpoints({
	endpoints: (builder) => ({
		visionChat: builder.mutation({
			query: (payload) => ({
				url: `${API_ENDPOINTS.AI}/chat`,
				method: "POST",
				body: payload, // 直接使用 payload 作为请求体
			}),
		}),
		textChat: builder.mutation({
			query: (payload) => ({
				url: `${API_ENDPOINTS.AI}/images/edits`,
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

		streamChat: builder.mutation({
			queryFn: async (
				{ payload, config, onStreamData, signal },
				{ dispatch, getState },
				extraOptions,
				baseQuery,
			) => {
				const createStreamRequestBody = (payload: any, config: any) => {
					const model = config.model || "gpt-3.5-turbo-16k";
					const promotMessage = createPromotMessage(config);
					const { userMessage, prevMessages } = payload;

					return {
						type: "stream",
						model,
						messages: [
							promotMessage,
							...prevMessages,
							{ role: "user", content: userMessage },
						],
						temperature: config.temperature || 0.8,
						max_tokens: config.max_tokens || 4096,
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
				const token = getState().auth.currentToken;
				const headers = {
					"Content-Type": "application/json",
					// 如果 token 存在，则添加到 headers
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				};

				try {
					const response = await fetch(url, {
						method: "POST",
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

					await readChunks(reader, onStreamData);
				} catch (error) {
					// 处理错误
					return { error: { status: "FETCH_ERROR", data: error.message } };
				}
			},
		}),
	}),
});

export const {
	useVisionChatMutation,
	useTextChatMutation,
	useGenerateAudioMutation,
	useStreamChatMutation,
	useGenerateImageEditMutation,
	useGenerateImageVariationMutation,
} = aiApi;
