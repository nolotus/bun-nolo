import { generatePrompt } from "../prompt/generateContent";
import { pickMessages } from "./pickMessages";

export const createMessages = (
	userInput: string | any,
	prevMsgs,
	cybotConfig,
) => {
	const messages = [...prevMsgs, { role: "user", content: userInput }];

	// 检查是否包含 "o1-mini"
	if (cybotConfig.model.includes("o1-mini")) {
		// 不添加 promptContent 消息
		return pickMessages(messages);
	}

	// 如果包含 "o1" 但不包含 "o1-mini"，则角色为 "develop"
	const role = cybotConfig.model.includes("o1") ? "develop" : "system";

	// 生成提示内容
	const promptContent = generatePrompt(
		cybotConfig.prompt,
		cybotConfig.name,
		navigator.language,
	);

	// 将提示内容添加到消息列表的开始
	messages.unshift({
		role: role,
		content: promptContent,
	});

	return pickMessages(messages);
};
