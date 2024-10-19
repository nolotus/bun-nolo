import { sendNoloChatRequest } from "chat/messages/chatStreamRequest";
import { getFilteredMessages } from "chat/messages/utils";
import { selectCurrentServer } from "setting/settingSlice";
import { ulid } from "ulid";
import { read, setOne } from "database/dbSlice";
import { generateIdWithCustomId } from "core/generateMainKey";
import { selectCurrentUserId } from "auth/authSlice";
import { generateContent } from "../prompt/generateContent";

import { updateInputTokens, updateOutputTokens } from "chat/dialog/dialogSlice";

import {
  addUserMessage,
  messageStreamEnd,
  messageStreaming,
} from "chat/messages/messageSlice";

export const sendOpenAIRequest = async (cybotId, userInput, thunkApi) => {
  const dispatch = thunkApi.dispatch;
  const state = thunkApi.getState();
  const userId = selectCurrentUserId(state);

  console.log("cybotId", cybotId);
  const readAction = await dispatch(read({ id: cybotId }));
  const cybotConfig = readAction.payload;
  console.log("cybotConfig", cybotConfig);
  const config = {
    ...cybotConfig,
    responseLanguage: navigator.language,
  };

  let previousMessages = getFilteredMessages(state);
  const model = cybotConfig.model;

  const createChatRequestBody = (
    config: any,
    userInput: string,
    previousMessages: Array<Message>,
  ) => {
    const prompt = generateContent(
      config.prompt,
      config.name,
      config.responseLanguage,
    );
    let max_tokens = config.max_tokens;
    if (model === "o1-mini" || model === "o1-preview") {
      max_tokens = 65536;
    }
    return {
      model: config.model,
      max_tokens: config.max_tokens || null,
      previousMessages,
      userInput,
      prompt,
    };
  };

  const requestBody = createChatRequestBody(
    config,
    userInput,
    previousMessages,
  );
  const controller = new AbortController();
  const token = state.auth.currentToken;

  const signal = controller.signal;

  const currentServer = selectCurrentServer(state);
  // dispatch(addUserMessage({}));
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
  const response = await sendNoloChatRequest({
    currentServer,
    requestBody,
    signal,
    token,
  });
  const result = await response.json();
  console.log("result", result);

  const receiveContent = result.choices[0].message.content;
  console.log("receiveContent", receiveContent);

  const usage = result.usage;
  console.log("usage", usage);
  if (usage) {
    // thunkApi.dispatch(updateInputTokens());
    // thunkApi.dispatch(updateOutputTokens());
  }
  dispatch(
    messageStreamEnd({
      id,
      content: receiveContent,
      cybotId,
    }),
  );

  return result;
};
