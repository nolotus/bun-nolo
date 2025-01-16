// chatRequest.ts

import { createMessages } from "ai/api/createMessages";
import { prepareTools } from "ai/tools/prepareTools";
import { updateDialogTitle, updateTokens } from "chat/dialog/dialogSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "../api/apiEndpoints";
import { performFetchRequest } from "./fetchUtils";
import { createDialogMessageKey } from "database/keys";
import { extractCustomId } from "core/prefix";

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
  dialogKey,
}) => {
  const { dispatch, getState } = thunkApi;
  const dialogId = extractCustomId(dialogKey);
  const controller = new AbortController();
  const signal = controller.signal;
  const currentServer = selectCurrentServer(getState());
  const messageId = createDialogMessageKey(dialogId);

  const messages = createMessages(content, prevMsgs, cybotConfig);
  const model = cybotConfig.model;
  const bodyData = { model, messages, stream: true };
  if (cybotConfig.tools?.length > 0) {
    const tools = prepareTools(cybotConfig.tools);
    bodyData.tools = tools;
  }

  let contentBuffer = "";
  let reader;

  try {
    dispatch(
      messageStreaming({
        id: messageId,
        content: "Loading...",
        role: "assistant",
        cybotId: cybotConfig.id,
        controller,
      })
    );

    const api = getApiEndpoint(cybotConfig);
    const response = await performFetchRequest(
      cybotConfig,
      api,
      bodyData,
      currentServer,
      signal
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        const final = {
          id: messageId,
          content: contentBuffer || "Empty response",
          role: "assistant",
          cybotId: cybotConfig.id,
        };
        dispatch(messageStreamEnd(final));
        dispatch(updateDialogTitle({ dialogKey, cybotConfig }));
        break;
      }

      const result = decoder.decode(value);
      const parsedResults = parseMultilineSSE(result);

      for (const parsedData of parsedResults) {
        if (parsedData.error) {
          const errorMsg = `Error: ${parsedData.error.message}`;
          dispatch(
            messageStreamEnd({
              id: messageId,
              content: contentBuffer || errorMsg,
              role: "assistant",
              cybotId: cybotConfig.id,
            })
          );
          throw new Error(errorMsg);
        }

        const content = parsedData.choices?.[0]?.delta?.content || "";
        if (parsedData.usage) {
          dispatch(
            updateTokens({ dialogId, usage: parsedData.usage, cybotConfig })
          );
        }

        if (content) {
          contentBuffer += content;
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
    const errorContent =
      error.name === "AbortError"
        ? `${contentBuffer}\n[Interrupted]`
        : `${contentBuffer || "Error"}: ${error.message}`;

    dispatch(
      messageStreamEnd({
        id: messageId,
        content: errorContent,
        role: "assistant",
        cybotId: cybotConfig.id,
      })
    );

    if (error.name !== "AbortError") {
      throw error;
    }
  } finally {
    if (reader) {
      reader.releaseLock();
    }
  }
};
