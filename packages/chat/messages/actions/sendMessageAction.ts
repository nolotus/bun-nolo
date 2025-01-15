import { sendClaudeRequest } from "ai/chat/sendClaudeRequest";
import { sendCommonChatRequest } from "ai/chat/sendCommonRequest";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { read } from "database/dbSlice";
import { extractCustomId } from "core/prefix";
import { selectCurrentUserId } from "auth/authSlice";
import { createDialogMessageKey } from "database/keys";

import { addMsg } from "../messageSlice";
import { getFilteredMessages } from "../utils";

export const sendMessageAction = async (args, thunkApi) => {
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;
  const dialogConfig = selectCurrentDialogConfig(state);
  const cybotConfig = await dispatch(read(dialogConfig.cybots[0])).unwrap();
  const { content } = args;
  const prevMsgs = getFilteredMessages(state);
  const dialogKey = dialogConfig.id;

  const dialogId = extractCustomId(dialogKey);
  const userId = selectCurrentUserId(state);
  const msgId = createDialogMessageKey(dialogId);

  const msg = {
    id: msgId,
    role: "user",
    content,
    userId,
  };
  await thunkApi.dispatch(addMsg(msg));

  if (
    cybotConfig.provider === "deepinfra" ||
    cybotConfig.provider === "fireworks" ||
    cybotConfig.provider === "deepseek" ||
    cybotConfig.provider === "xai" ||
    cybotConfig.provider === "openai" ||
    cybotConfig.provider === "mistral" ||
    cybotConfig.provider === "google" ||
    cybotConfig.provider === "ollama" || // 添加 ollama
    cybotConfig.provider === "Custom" // 添加 Custom
  ) {
    sendCommonChatRequest({
      content,
      cybotConfig,
      thunkApi,
      prevMsgs,
      dialogKey,
    });
    return;
  }

  if (cybotConfig.provider === "anthropic") {
    sendClaudeRequest({
      content,
      cybotConfig,
      thunkApi,
      prevMsgs,
      dialogKey,
    });
    return;
  }
};
