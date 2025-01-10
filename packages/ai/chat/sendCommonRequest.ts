// chatRequest.ts

import { createMessages } from "ai/api/createMessages";
import { prepareTools } from "ai/tools/prepareTools";
import { updateDialogTitle, updateTokens } from "chat/dialog/dialogSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { setOne } from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "../api/apiEndpoints";
import { performFetchRequest } from "./fetchUtils";
import { createDialogMessageKey } from "database/keys";

function parseMultilineSSE(rawText: string) {
  const results = [];
  const lines = rawText.split("\n");
  let currentData = "";

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith("data:")) {
      const jsonStr = line.substring(5).trim();
      try {
        const parsedData = JSON.parse(jsonStr);
        results.push(parsedData);
      } catch (e) {
        currentData += jsonStr;
      }
    } else if (currentData) {
      currentData += line;
      try {
        const parsedData = JSON.parse(currentData);
        results.push(parsedData);
        currentData = "";
      } catch (e) {
        // 继续累积数据
      }
    }
  }

  return results;
}

export const sendCommonChatRequest = async ({
  content,
  cybotConfig,
  thunkApi,
  prevMsgs,
  dialogId,
}) => {
  const { dispatch, getState } = thunkApi;

  const controller = new AbortController();
  const signal = controller.signal;
  const currentServer = selectCurrentServer(getState());

  const messages = createMessages(content, prevMsgs, cybotConfig);
  const model = cybotConfig.model;
  const bodyData = { model, messages, stream: true };
  if (cybotConfig.tools?.length > 0) {
    const tools = prepareTools(cybotConfig.tools);
    bodyData.tools = tools;
  }
  const messageId = createDialogMessageKey(dialogId);

  let contentBuffer = "";
  let reader;

  try {
    const message = {
      id: messageId,
      content: "Loading...",
      role: "assistant",
      cybotId: cybotConfig.id,
      controller,
    };
    dispatch(setOne(message));
    dispatch(messageStreaming(message));
    const api = getApiEndpoint(cybotConfig);

    const response = await performFetchRequest(
      cybotConfig,
      api,
      bodyData,
      signal,
      currentServer
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        dispatch(
          messageStreamEnd({
            id: messageId,
            content: contentBuffer,
            role: "assistant",
            cybotId: cybotConfig.id,
          })
        );
        dispatch(
          updateDialogTitle({
            dialogId,
            cybotConfig,
          })
        );
        break;
      }

      const result = decoder.decode(value);

      const parsedResults = parseMultilineSSE(result);

      for (const parsedData of parsedResults) {
        if (parsedData.error) {
          // Log the error and handle it accordingly
          console.error("Error received from API:", parsedData.error.message);
          dispatch(
            messageStreaming({
              id: messageId,
              content: "Error: " + parsedData.error.message,
              role: "assistant",
              cybotId: cybotConfig.id,
              controller,
            })
          );
          break;
        }

        const content = parsedData.choices?.[0]?.delta?.content || "";
        let usage;
        if (parsedData.usage) {
          usage = parsedData.usage;
          console.log("usage", usage);
          dispatch(updateTokens({ usage, cybotConfig }));
        }

        if (content) {
          contentBuffer += content;

          dispatch(
            setOne({
              id: messageId,
              content: contentBuffer,
              role: "assistant",
              cybotId: cybotConfig.id,
              controller,
            })
          );
          dispatch(
            messageStreaming({
              id: messageId,
              content: contentBuffer,
              role: "assistant",
              cybotId: cybotConfig.id,
              controller,
            })
          );
        }
      }
    }
  } catch (error) {
    console.error("Request failed:", error);
    dispatch(
      messageStreaming({
        id: messageId,
        content: "Error: " + error.message,
        role: "assistant",
        cybotId: cybotConfig.id,
        controller,
      })
    );
    throw error;
  } finally {
    if (reader) {
      reader.releaseLock();
    }
  }
};
