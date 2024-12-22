import { sendClaudeRequest } from "ai/chat/sendClaudeRequest";
import { sendCommonChatRequest } from "ai/chat/sendCommonRequest";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { read } from "database/dbSlice";

import { addUserMessage, streamLLmId } from "../messageSlice";
import { getFilteredMessages } from "../utils";

export const sendMessageAction = async (args, thunkApi) => {
	const state = thunkApi.getState();
	const dispatch = thunkApi.dispatch;
	const dialogConfig = selectCurrentDialogConfig(state);

	const cybotConfig = await dispatch(
		read({ id: dialogConfig.cybots[0] }),
	).unwrap();

	const { content } = args;
	const prevMsgs = getFilteredMessages(state);
	//need before add user message

	thunkApi.dispatch(addUserMessage({ content }));

	if (cybotConfig.provider) {
		if (
			cybotConfig.provider === "deepinfra" ||
			cybotConfig.provider === "fireworks" ||
			cybotConfig.provider === "deepseek" ||
			cybotConfig.provider === "xai" ||
			cybotConfig.provider === "openai" ||
			cybotConfig.provider === "mistral"
		) {
			sendCommonChatRequest({
				content,
				cybotConfig,
				thunkApi,
				prevMsgs,
				dialogId: dialogConfig.id,
			});
			return;
		}
	}
	if (cybotConfig.provider === "anthropic") {
		sendClaudeRequest({ cybotConfig, content, thunkApi });
		return;
	}
	//add user Message

	// after addUserMessage maybe multi cybot

	if (cybotConfig.llmId) {
		await dispatch(streamLLmId({ cybotConfig, prevMsgs, content }));
		return;
	}
};
