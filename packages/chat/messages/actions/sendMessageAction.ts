import { sendClaudeRequest } from "ai/chat/sendClaudeRequest";
import { sendCommonChatRequest } from "ai/chat/sendCommonRequest";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { read } from "database/dbSlice";
import { extractCustomId } from "core/prefix";
import { selectCurrentUserId } from "auth/authSlice";
import { createDialogMessageKey } from "database/keys";

import { addMsg } from "../messageSlice";
import { getFilteredMessages } from "../utils";
const requestHandlers = {
  deepinfra: sendCommonChatRequest,
  fireworks: sendCommonChatRequest,
  deepseek: sendCommonChatRequest,
  xai: sendCommonChatRequest,
  openai: sendCommonChatRequest,
  mistral: sendCommonChatRequest,
  google: sendCommonChatRequest,
  ollama: sendCommonChatRequest,
  groq: sendCommonChatRequest,
  anthropic: sendClaudeRequest,
  // 添加其他provider的处理函数
};

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

  const handler = requestHandlers[cybotConfig.provider.toLowerCase()];

  if (handler) {
    handler({
      content,
      cybotConfig,
      thunkApi,
      prevMsgs,
      dialogKey,
    });
  } else {
    throw new Error(`Unsupported provider: ${cybotConfig.provider}`);
  }
};
