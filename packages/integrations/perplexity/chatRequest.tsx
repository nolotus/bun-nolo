import { Message, RequestPayloadProperties } from "ai/types";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getProxyConfig } from "utils/getProxyConfig";
type RequestPayload = RequestPayloadProperties & {
	messages: Message[];
};

const proxyConfig = getProxyConfig();

function createRequestConfig(
	requestPayload: RequestPayload,
	authorization: string,
): AxiosRequestConfig {
	return {
		url: "https://api.perplexity.ai/chat/completions",
		method: "POST",
		responseType: "stream",
		headers: {
			"Content-Type": "application/json",
			Authorization: authorization,
		},
		data: {
			...requestPayload,
			stream: true,
		},
		...proxyConfig,
	};
}

export async function chatRequest(
	requestPayload: RequestPayload,
): Promise<AxiosResponse<any>> {
	const authToken = process.env.PERPLEXITY_AI_TOKEN || "";
	const config = createRequestConfig(requestPayload, authToken);
	try {
		return await axios.request(config);
	} catch (error) {
		console.error("Error making the request:", error.message);
		throw error;
	}
}
