import { sendClaudeRequest } from "ai/chat/sendClaudeRequest";
import { sendCommonChatRequest } from "ai/chat/sendCommonRequest";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { read } from "database/dbSlice";
import { extractCustomId } from "core/prefix";
import { selectCurrentUserId } from "auth/authSlice";
import { createDialogMessageKey } from "database/keys";
import { createMessages } from "ai/api/createMessages";
import { buildReferenceContext } from "ai/context/buildReferenceContext";
import { generateRequestBody } from "integrations/anthropic/generateRequestBody";

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
  anthropic: sendClaudeRequest,
  sambanova: sendCommonChatRequest,
  openrouter: sendCommonChatRequest,
  custom: sendCommonChatRequest,
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
  await dispatch(addMsg(msg));
  const providerName = cybotConfig.provider.toLowerCase();
  console.log("providerName", providerName);
  const handler = requestHandlers[providerName];
  const model = cybotConfig.model;
  const context = await buildReferenceContext(cybotConfig, dispatch);

  let bodyData;
  if (providerName === "anthropic") {
    bodyData = generateRequestBody(cybotConfig, content, prevMsgs, context);
  } else {
    const messages = createMessages(content, prevMsgs, cybotConfig, context);
    bodyData = {
      model,
      messages,
      stream: true,
    };
    if (providerName === "google" || providerName === "openai") {
      bodyData.stream_options = { include_usage: true };
    }
  }

  if (handler) {
    handler({
      bodyData,
      cybotConfig,
      thunkApi,
      dialogKey,
    });
  } else {
    throw new Error(`Unsupported provider: ${cybotConfig.provider}`);
  }
};
