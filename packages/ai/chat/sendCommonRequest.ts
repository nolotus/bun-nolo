import { createMessages } from "ai/api/createMessages";
import { prepareTools } from "ai/tools/prepareTools";
import { selectCurrentUserId } from "auth/authSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { getFilteredMessages } from "chat/messages/utils";
import { generateIdWithCustomId } from "core/generateMainKey";
import { setOne } from "database/dbSlice";
import { ulid } from "ulid";

import { updateDialogTitle } from "chat/dialog/dialogSlice";
import { API_ENDPOINTS } from "database/config";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "../api/apiEndpoints";

function parseMultilineSSE(rawText) {
	const results = [];
	const lines = rawText.split("\n");
	let currentData = "";

	for (let line of lines) {
		line = line.trim();
		if (!line) continue;

		if (line.startsWith("data:")) {
			const jsonStr = line.substring(5).trim();
			try {
				const parsedData = JSON.parse(jsonStr);
				results.push(parsedData);
			} catch (e) {
				currentData += jsonStr;
			}
		} else if (currentData) {
			currentData += line;
			try {
				const parsedData = JSON.parse(currentData);
				results.push(parsedData);
				currentData = "";
			} catch (e) {
				// 继续累积数据
			}
		}
	}

	return results;
}

const createRequestConfig = (cybotConfig, bodyData, signal) => ({
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${cybotConfig.apiKey}`,
	},
	body: JSON.stringify(bodyData),
	signal,
});

//prevMsgs is need outside ,if inside will include our message
export const sendCommonChatRequest = async ({
	content,
	cybotConfig,
	thunkApi,
	prevMsgs,
	dialogId,
}) => {
	const { dispatch, getState } = thunkApi;

	const controller = new AbortController();
	const signal = controller.signal;
	const currentServer = selectCurrentServer(getState());

	// 准备请求数据
	const messages = createMessages(content, prevMsgs, cybotConfig);
	const model = cybotConfig.model;

	const bodyData = { model, messages, stream: true };
	if (cybotConfig.tools?.length > 0) {
		const tools = prepareTools(cybotConfig.tools);
		bodyData.tools = tools;
	}
	// 生成消息ID
	const userId = selectCurrentUserId(getState());
	const messageId = generateIdWithCustomId(userId, ulid(), { isJSON: true });

	let contentBuffer = "";
	let reader;

	try {
		// 初始化加载状态
		const message = {
			id: messageId,
			content: "Loading...",
			role: "assistant",
			cybotId: cybotConfig.id,
			controller,
		};
		dispatch(setOne(message));
		dispatch(messageStreaming(message));

		const api = getApiEndpoint(cybotConfig.provider);

		let response;
		if (!cybotConfig.useServerProxy) {
			response = await fetch(
				api,
				createRequestConfig(cybotConfig, bodyData, signal),
			);
		} else {
			response = await fetch(`${currentServer}${API_ENDPOINTS.PROXY}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...bodyData,
					url: api,
					KEY: cybotConfig.apiKey,
				}),
				signal,
			});
		}

		if (!response.ok) {
			throw new Error(`API request failed: ${response.statusText}`);
		}

		reader = response.body.getReader();
		const decoder = new TextDecoder();

		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				// 流结束时发送最终消息

				dispatch(
					messageStreamEnd({
						id: messageId,
						content: contentBuffer,
						role: "assistant",
						cybotId: cybotConfig.id,
					}),
				);
				const currentMsgs = getFilteredMessages(thunkApi.getState());
				dispatch(
					updateDialogTitle({
						dialogId,
						currentMsgs,
					}),
				);
				break;
			}

			const result = decoder.decode(value);
			const parsedResults = parseMultilineSSE(result);

			for (const parsedData of parsedResults) {
				const content = parsedData.choices?.[0]?.delta?.content || "";
				if (content) {
					contentBuffer += content;
					// 更新当前消息内容
					dispatch(
						setOne({
							id: messageId,
							content: contentBuffer,
							role: "assistant",
							cybotId: cybotConfig.id,
							controller,
						}),
					);
					dispatch(
						messageStreaming({
							id: messageId,
							content: contentBuffer,
							role: "assistant",
							cybotId: cybotConfig.id,
							controller,
						}),
					);
				}
			}
		}
	} catch (error) {
		console.error("Request failed:", error);
		dispatch(
			messageStreaming({
				id: messageId,
				content: "Error: " + error.message,
				role: "assistant",
				cybotId: cybotConfig.id,
				controller,
			}),
		);
		throw error;
	} finally {
		// 确保在结束时释放reader
		if (reader) {
			reader.releaseLock();
		}
	}
};
