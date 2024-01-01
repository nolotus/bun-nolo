import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { tokenStatic } from "ai/client/static";
import {
	useWriteHashMutation,
	useLazyGetEntriesQuery,
} from "database/services";
import { nolotusId } from "core/init";
import { updateData } from "database/dbSlice";
import { API_ENDPOINTS } from "database/config";

import { nanoid } from "@reduxjs/toolkit";
import { getModefromContent } from "../hooks/getModefromContent";
import { getContextFromMode } from "../hooks/getContextfromMode";
import { useAppDispatch, useAppSelector, useAuth } from "app/hooks";
import MessageInput from "./MessageInput"; // 导入 MessageInput 组件
import {
	messageStreaming,
	messagesReachedMax,
	messageStreamEnd,
	receiveMessage,
	sendMessage,
	retry,
	clearMessages,
	continueMessage,
	messageEnd,
} from "../messages/messageSlice";
import { selectChat } from "../chatSlice";
import MessageItem from "./Messageitem";
import { getLogger } from "utils/logger";
import { selectMessage } from "../messages/selector";
import { createContent } from "ai/client/createContent";
import { retrieveFirstToken } from "auth/client/token";
import RNFetchBlob from "react-native-blob-util";
const chatUrl = `${API_ENDPOINTS.AI}/chat`;

const chatWindowLogger = getLogger("ChatWindow"); // 初始化日志

export function ChatScreen() {
	const auth = useAuth();
	const [getChatList, { isLoading, isSuccess }] = useLazyGetEntriesQuery();
	const { tempMessage } = useAppSelector(selectMessage);

	const fetchChatList = async () => {
		const options = {
			isJSON: true,
			condition: {
				type: "tokenStatistics",
			},
			limit: 10000,
		};
		const nolotusTokenStatisticsList = await getChatList({
			userId: nolotusId,
			options,
			domain: "https://nolotus.com",
		}).unwrap();

		dispatch(updateData({ data: nolotusTokenStatisticsList }));
	};
	useEffect(() => {
		fetchChatList();
	}, []);
	const messages = useAppSelector((state) => state.message.messages);
	const dispatch = useAppDispatch();

	const streamChat = async ({ payload, config, onStreamData, signal }) => {
		console.log("streamChat");

		const createStreamRequestBody = (payload: any, config: any) => {
			const model = config.model || "gpt-3.5-turbo-16k";
			const content = createContent(config);
			const { userMessage, prevMessages } = payload;

			return {
				type: "stream",
				model,
				messages: [
					{ role: "system", content },
					...prevMessages,
					{ role: "user", content: userMessage },
				],
				temperature: config.temperature || 0.8,
				max_tokens: config.max_tokens || 2048,
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
		const url = `https://nolotus.com${chatUrl}`;
		const token = retrieveFirstToken();
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};

		try {
			const response = await RNFetchBlob.config({
				/* ...配置... */
			}).fetch("POST", url, headers, JSON.stringify(requestBody));
			if (response.info().status === 200) {
				let stream = response.stream();
				console.log("stream", stream);
				let readStream = (stream) =>
					stream
						.read(4096)
						.then((chunk) => {
							if (chunk) {
								onStreamData(chunk);
								// 递归调用继续读取下一块
								readStream(stream);
							} else {
								// 数据流结束
								console.log("Stream ended");
							}
						})
						.catch((err) => {
							// 错误处理
							console.error("Error while reading stream:", err);
						});

				readStream(stream);
			} else {
				// 响应状态码不是200时的处理逻辑
				console.error("Error status:", response.info().status);
			}

			// await readChunks(reader, onStreamData);
		} catch (error) {
			// 处理错误
			return { error: { status: "FETCH_ERROR", data: error.message } };
		}
	};
	const { currentChatConfig } = useAppSelector(selectChat);
	const [writeHashData] = useWriteHashMutation();

	const [requestFailed, setRequestFailed] = useState(false);

	const abortControllerRef = useRef(null);
	const handleStreamData = (data) => {
		const text = new TextDecoder("utf-8").decode(data);
		const lines = text.trim().split("\n");
		lines.forEach((line) => {
			// 使用正则表达式匹配 "data:" 后面的内容
			const match = line.match(/data: (done|{.*}|)/);

			if (match && match[1] !== undefined) {
				const statusOrJson = match[1];
				if (statusOrJson === "" || statusOrJson === "done") {
					chatWindowLogger.info(
						statusOrJson === ""
							? "Received gap (empty string)"
							: "Received done",
					);
				} else {
					try {
						const json = JSON.parse(statusOrJson);
						// 自然停止
						const finishReason = json.choices[0].finish_reason;
						if (finishReason === "stop") {
							dispatch(messageStreamEnd({ role: "assistant", content: temp }));
							const staticData = {
								dialogType: "receive",
								model: json.model,
								length: tokenCount,
								chatId: json.id,
								chatCreated: json.created,
								userId: auth.user?.userId,
								username: auth.user?.username,
							};
							tokenStatic(staticData, auth, writeHashData);

							tokenCount = 0; // 重置计数器
						} else if (
							finishReason === "length" ||
							finishReason === "content_filter"
						) {
							dispatch(messagesReachedMax());
						} else if (finishReason === "function_call") {
							// nerver use just sign it
						} else {
							temp = (temp || "") + (json.choices[0]?.delta?.content || "");
							dispatch(
								messageStreaming({
									role: "assistant",
									id: json.id,
									content: temp,
								}),
							);
						}
						if (json.choices[0]?.delta?.content) {
							tokenCount++; // 单次计数
						}
					} catch (e) {
						chatWindowLogger.error({ error: e }, "Error parsing JSON");
					}
				}
			}
		});
	};
	const handleStreamMessage = async (newMessage, prevMessages) => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		abortControllerRef.current = new AbortController();
		await streamChat({
			payload: {
				userMessage: newMessage,
				prevMessages: prevMessages,
			},

			config: currentChatConfig,
			onStreamData: handleStreamData,
			signal: abortControllerRef.current.signal,
		});
	};
	const handleSendMessage = async (newContent: string) => {
		if (!newContent.trim()) {
			return;
		}
		setRequestFailed(false);
		dispatch(sendMessage({ role: "user", content: newContent, id: nanoid() }));

		const mode = getModefromContent(newContent);
		const context = await getContextFromMode(mode, newContent);

		if (context?.isError) {
			await handleStreamMessage(newContent, messages);
			const staticData = {
				dialogType: "send",
				model: currentChatConfig?.model,
				length: newContent.length,
				userId: auth?.user?.userId,
				username: auth?.user?.username,
				date: new Date(),
			};
			tokenStatic(staticData, auth, writeHashData);
		} else {
			if (mode === "image" && context.image) {
				dispatch(
					receiveMessage({
						role: "assistant",
						content: "Here is your generated image:",
						image: context.image,
					}),
				);
			}
			if (mode === "surf" && context.content) {
				dispatch(
					receiveMessage({
						role: "assistant",
						content: context.content,
					}),
				);
			}
		}

		try {
			if (mode === "stream") {
				await handleStreamMessage(newContent, messages);
				const staticData = {
					dialogType: "send",
					model: currentChatConfig?.model,
					length: newContent.length,
					userId: auth?.user?.userId,
					username: auth?.user?.username,
					date: new Date(),
				};
				tokenStatic(staticData, auth, writeHashData);
			}
		} catch (error) {
			chatWindowLogger.error({ error }, "Error while sending message");
			setRequestFailed(true);
		} finally {
			dispatch(messageEnd());
		}
	};
	// 渲染单条消息的UI
	const renderMessage = ({ item }) => <MessageItem item={item} />;
	return (
		<View style={styles.container}>
			<FlatList
				data={messages}
				renderItem={renderMessage}
				keyExtractor={(item) => item.id}
				style={styles.messageList}
			/>
			<MessageItem item={tempMessage} key={tempMessage.id} />
			<MessageInput onSend={handleSendMessage} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "flex-end", // 该属性确保输入框始终在底部
	},
	input: {
		height: 40,
		marginHorizontal: 12,
		borderWidth: 1,
		padding: 10,
	},
	messageList: {
		flex: 1,
		paddingTop: 12,
	},
	message: {
		padding: 10,
		margin: 10,
		backgroundColor: "lightgrey",
		borderRadius: 20,
	},
	messageText: {
		color: "black",
	},
});
