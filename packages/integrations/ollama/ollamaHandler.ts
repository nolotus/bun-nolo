import type { InputMessage, OutputMessage } from "ai/messages/type";

import { OllamaMessageSchema } from "./type";

// Llava 模型处理逻辑

export const ollamaHandler = {
	// 辅助函数
	extractBase64FromDataUrl(url: string): string {
		return url.startsWith("data:") ? url.split(",")[1] : url;
	},

	// 转换单个消息
	transformSingleMessage(input: InputMessage): OutputMessage {
		let textContent = "";
		let imageUrls: string[] = [];

		if (typeof input.content === "string") {
			textContent = input.content;
		} else {
			textContent =
				input.content.find((item) => item.type === "text")?.text || "";
			imageUrls = input.content
				.filter((item) => item.type === "image_url")
				.map((item) => this.extractBase64FromDataUrl(item.image_url!.url));
		}

		const result: OutputMessage = {
			role: input.role,
			content: textContent,
		};

		if (imageUrls.length > 0) {
			result.images = imageUrls;
		}

		return result;
	},

	// 处理 prompt 消息
	processPrompt(promptMessage: InputMessage): OutputMessage {
		return this.transformSingleMessage(promptMessage);
	},

	// 处理历史消息
	processPrevMessages(prevMsgs: InputMessage[]): OutputMessage[] {
		return prevMsgs.map((msg) => this.transformSingleMessage(msg));
	},

	// 处理当前用户输入
	processCurrentInput(
		content: string | InputMessage["content"],
	): OutputMessage {
		const inputMessage: InputMessage = { role: "user", content };
		return this.transformSingleMessage(inputMessage);
	},

	// 主要处理函数
	prepareMsgs({ promotMessage, prevMsgs, content }): OutputMessage[] {
		const processedPrompt = this.processPrompt(promotMessage);
		const processedPrevMsgs = this.processPrevMessages(prevMsgs);
		const processedCurrentInput = this.processCurrentInput(content);

		const processedMessages = [
			processedPrompt,
			...processedPrevMsgs,
			processedCurrentInput,
		];

		// Zod 验证
		processedMessages.forEach((message, index) => {
			try {
				OllamaMessageSchema.parse(message);
			} catch (error) {
				console.error(`Message at index ${index} is invalid:`, error.errors);
				throw new Error(
					`Message at index ${index} is invalid: ${error.errors}`,
				);
			}
		});

		return processedMessages;
	},
};
