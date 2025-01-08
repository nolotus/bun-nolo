import { selectCurrentUserId } from "auth/authSlice";
import { selectCurrentServer } from "setting/settingSlice";

import { generateIdWithCustomId } from "core/generateMainKey";
import { ulid } from "ulid";

import { API_ENDPOINTS } from "database/config";
import { generateRequestBody } from "integrations/anthropic/generateRequestBody";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { setOne } from "database/dbSlice";
import { updateDialogTitle, updateTokens } from "chat/dialog/dialogSlice";

// 获取当前用户ID和服务器
function getCurrentUserAndServer(thunkApi) {
  const state = thunkApi.getState();
  const userId = selectCurrentUserId(state);
  const currentServer = selectCurrentServer(state);
  return { userId, currentServer };
}

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
      return await fetch(`${currentServer}${API_ENDPOINTS.PROXY}`, {
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
  dialogId,
}) => {
  const cybotId = cybotConfig.id;

  const dispatch = thunkApi.dispatch;
  const { userId, currentServer } = getCurrentUserAndServer(thunkApi);
  const id = generateIdWithCustomId(userId, ulid(), {
    isJSON: true,
  });

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
    dispatch(
      updateDialogTitle({
        dialogId,
        cybotConfig,
      })
    );
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
      if (done) {
        dispatch(
          messageStreamEnd({
            id,
            content: accumulatedContent,
            cybotId: cybotConfig.id,
            role: "assistant",
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
                    cybotConfig,
                    usage: jsonData.message.usage,
                  })
                );
                const message = {
                  id,
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
                    id,
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
