import { generatePrompt } from "../prompt/generateContent";
import { pickMessages } from "./pickMessages";

export const createMessages = (
	userInput: string | any,
	prevMsgs,
	cybotConfig,
) => {
	const promptContent = generatePrompt(
		cybotConfig.prompt,
		cybotConfig.name,
		navigator.language,
	);

	const messages = [
		{
			role: "system",
			content: promptContent,
		},
		...prevMsgs,
		{ role: "user", content: userInput },
	];
	return pickMessages(messages);
};
