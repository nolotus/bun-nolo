import { sendClaudeRequest } from "ai/chat/sendClaudeRequest";
import { sendCommonChatRequest } from "ai/chat/sendCommonRequest";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { read } from "database/dbSlice";
import { extractCustomId } from "core";
import { selectCurrentUserId } from "auth/authSlice";

import { addUserMessage } from "../messageSlice";
import { getFilteredMessages } from "../utils";
import { ulid } from "ulid";

export const sendMessageAction = async (args, thunkApi) => {
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;
  const dialogConfig = selectCurrentDialogConfig(state);

  const cybotConfig = await dispatch(
    read({ id: dialogConfig.cybots[0] })
  ).unwrap();

  const { content } = args;
  const prevMsgs = getFilteredMessages(state);
  const dialog = selectCurrentDialogConfig(state);

  const dialogId = extractCustomId(dialog.id);
  const userId = selectCurrentUserId(state);

  const id = `dialog-${dialogId}-msg-${ulid()}`;

  const message = {
    id,
    role: "user",
    content,
    userId,
  };
  thunkApi.dispatch(addUserMessage(message));

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
      dialogId: dialogConfig.id,
    });
    return;
  }

  if (cybotConfig.provider === "anthropic") {
    sendClaudeRequest({
      content,
      cybotConfig,
      thunkApi,
      prevMsgs,
      dialogId: dialogConfig.id,
    });
    return;
  }
};
