import { sendNoloChatRequest } from "chat/messages/chatStreamRequest";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentUserId } from "auth/authSlice";
import { read, setOne } from "database/dbSlice";
import { getFilteredMessages } from "chat/messages/utils";
import { generateIdWithCustomId } from "core/generateMainKey";
import { ulid } from "ulid";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { decodeChunk } from "ai/client/stream";

import { handleClaudeModelResponse } from "ai/chat/handleClaudeModelRespons";

import { createStreamRequestBody } from "./createStreamRequestBody";

export const sendClaudeRequest = async (cybotId, userInput, thunkApi) => {
  const dispatch = thunkApi.dispatch;
  const state = thunkApi.getState();
  const userId = selectCurrentUserId(state);
  const currentServer = selectCurrentServer(state);

  console.log("cybotId", cybotId);
  const readAction = await dispatch(read({ id: cybotId }));
  const cybotConfig = readAction.payload;
  console.log("cybotConfig", cybotConfig);
  const config = {
    ...cybotConfig,
    responseLanguage: navigator.language,
  };
  let previousMessages = getFilteredMessages(state);
  console.log("previousMessages", previousMessages);
  const model = cybotConfig.model;

  const id = generateIdWithCustomId(userId, ulid(), {
    isJSON: true,
  });

  let message = {
    role: "assistant",
    id,
    content: "loading",
    cybotId,
  };
  dispatch(setOne(message));
  dispatch(messageStreaming(message));

  const requestBody = createStreamRequestBody(
    config,
    userInput,
    previousMessages,
  );
  const controller = new AbortController();
  const signal = controller.signal;
  const token = state.auth.currentToken;

  const response = await sendNoloChatRequest({
    currentServer,
    requestBody,
    signal,
    token,
  });
  const reader = response.body.getReader();
  let temp = "";
  let value: Uint8Array | undefined;

  try {
    while (true) {
      const result = await reader.read();
      value = result.value;
      if (result.done) {
        dispatch(
          messageStreamEnd({
            id,
            content: temp,
            cybotId,
          }),
        );
        return;
      }
      if (value) {
        console.log(temp);
        const text = decodeChunk(value);

        // 调用 handleGeminiModelStreamResponse，并传入 temp
        temp = handleClaudeModelResponse(
          text,
          id,
          cybotId,
          temp,
          thunkApi,
          controller,
        );
      }
    }
  } catch (err) {
    // handleError(err, value);
  } finally {
    reader.releaseLock();
  }
};
