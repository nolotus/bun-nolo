import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

import { createOpenAIRequestConfig } from "./config";
import { FrontEndRequestBody } from "./types";

export const chatRequest = async (
	requestBody: FrontEndRequestBody,
	isStream: boolean, // 改成 boolean，因为它不仅可以是 true，还可以是 false。
): Promise<AxiosResponse<any> | null> => {
	const data = {
		model: requestBody.model || "gpt-3.5-turbo-16k",
		messages: requestBody.messages,
		stream: isStream, // 使用传进来的 isStream 参数
		max_tokens: requestBody.max_tokens,
	};
	const config: AxiosRequestConfig = {
		...createOpenAIRequestConfig(),
		url: "https://api.openai.com/v1/chat/completions",
		method: "POST",
		// 根据 isStream 参数动态设置 responseType
		responseType: isStream ? "stream" : "json",
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
