import { selectCurrentServer } from "setting/settingSlice";
import { createDialogMessageKey } from "database/keys";

import { API_ENDPOINTS } from "database/config";
import { generateRequestBody } from "integrations/anthropic/generateRequestBody";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { setOne } from "database/dbSlice";
import { updateDialogTitle, updateTokens } from "chat/dialog/dialogSlice";
import { extractCustomId } from "core/prefix";

// 发送请求
async function sendRequest(cybotConfig, body, signal, currentServer) {
  try {
    const CLAUDE_API_ENDPOINT = "https://api.anthropic.com/v1/messages";
    if (!cybotConfig.useServerProxy) {
      return await fetch(CLAUDE_API_ENDPOINT, {
        method: "POST",
        headers: {
          "x-api-key": cybotConfig.apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        mode: "cors",
        body,
        signal,
      });
    } else {
      return await fetch(`${currentServer}${API_ENDPOINTS.CHAT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...JSON.parse(body),
          url: CLAUDE_API_ENDPOINT,
          KEY: cybotConfig.apiKey,
        }),
        signal,
      });
    }
  } catch (error) {
    console.error("发送请求失败:", error);
    throw error;
  }
}

export const sendClaudeRequest = async ({
  content,
  cybotConfig,
  thunkApi,
  prevMsgs,
  dialogKey,
}) => {
  const cybotId = cybotConfig.id;
  const dialogId = extractCustomId(dialogKey);
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;
  const currentServer = selectCurrentServer(state);

  const messageId = createDialogMessageKey(dialogId);

  const body = generateRequestBody(cybotConfig, content, prevMsgs);
  const controller = new AbortController();
  const signal = controller.signal;

  let reader;

  signal.addEventListener("abort", () => {
    console.log("Request was aborted");
    if (reader) {
      reader.cancel();
      reader.releaseLock();
    }
  });

  try {
    const response = await sendRequest(
      cybotConfig,
      body,
      signal,
      currentServer
    );

    reader = response.body.getReader();
    let accumulatedContent = "";

    while (true) {
      const { done, value } = await reader.read();
      console.log("accumulatedContent", accumulatedContent);
      if (done) {
        const final = {
          id: messageId,
          content: accumulatedContent,
          cybotId: cybotConfig.id,
          role: "assistant",
        };
        dispatch(messageStreamEnd(final));

        dispatch(
          updateDialogTitle({
            dialogKey,
            cybotConfig,
          })
        );
        break;
      }

      const text = new TextDecoder().decode(value);
      const lines = text.split("\n");
      for (const line of lines) {
        if (line.startsWith("data:")) {
          const data = line.substring(6);
          try {
            const jsonData = JSON.parse(data);
            console.log("Data:", jsonData);
            switch (jsonData.type) {
              case "message_start":
                dispatch(
                  updateTokens({
                    dialogId,
                    cybotConfig,
                    usage: jsonData.message.usage,
                  })
                );
                const message = {
                  id: messageId,
                  content: "Loading...",
                  role: "assistant",
                  cybotId,
                  controller,
                };
                dispatch(setOne(message));
                dispatch(messageStreaming(message));
                break;

              case "content_block_delta":
                const delta = jsonData.delta;
                if (delta && delta.text) {
                  accumulatedContent += delta.text;
                  const message = {
                    id: messageId,
                    content: accumulatedContent,
                    role: "assistant",
                    cybotId: cybotConfig.id,
                    controller,
                  };
                  dispatch(setOne(message));
                  dispatch(messageStreaming(message));
                }
                break;
              case "message_delta":
                dispatch(
                  updateTokens({
                    cybotConfig,
                    usage: jsonData.usage,
                  })
                );
                break;

              default:
                console.log("Unhandled data type:", jsonData.type);
            }
          } catch (error) {
            console.error("Failed to parse JSON data:", error);
          }
        }
      }
    }

    reader.releaseLock();
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted");
    } else {
      console.error("Request failed:", error);
    }
  } finally {
    if (reader) {
      reader.releaseLock();
    }
  }
};
