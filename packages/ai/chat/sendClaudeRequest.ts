import { selectCurrentServer } from "setting/settingSlice";
import { createDialogMessageKey } from "database/keys";
import { API_ENDPOINTS } from "database/config";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { updateDialogTitle, updateTokens } from "chat/dialog/dialogSlice";
import { extractCustomId } from "core/prefix";
import pino from "pino";

const logger = pino({ name: "claude-request" });

async function sendRequest(cybotConfig, body, signal, currentServer) {
  const CLAUDE_API_ENDPOINT = "https://api.anthropic.com/v1/messages";

  try {
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
    }

    return await fetch(`${currentServer}${API_ENDPOINTS.CHAT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...JSON.parse(body),
        url: CLAUDE_API_ENDPOINT,
        KEY: cybotConfig.apiKey,
        provider: cybotConfig.provider,
      }),
      signal,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to send request");
    throw error;
  }
}

export const sendClaudeRequest = async ({
  bodyData,
  cybotConfig,
  thunkApi,
  dialogKey,
}) => {
  const cybotId = cybotConfig.id;
  const dialogId = extractCustomId(dialogKey);
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;
  const currentServer = selectCurrentServer(state);
  const messageId = createDialogMessageKey(dialogId);

  const controller = new AbortController();
  const signal = controller.signal;

  let reader;
  let accumulatedContent = "";

  const cleanup = () => {
    if (reader) {
      try {
        reader.cancel();
        reader.releaseLock();
      } catch (e) {
        logger.error({ err: e }, "Error during reader cleanup");
      }
    }
  };

  const handleStreamEnd = async (
    content = accumulatedContent,
    error = null
  ) => {
    const final = {
      id: messageId,
      content: error ? `Error: ${error.message}` : content,
      cybotId: cybotConfig.id,
      role: "assistant",
      error: !!error,
    };

    await dispatch(messageStreamEnd(final));

    if (!error) {
      dispatch(updateDialogTitle({ dialogKey, cybotConfig }));
    }
  };

  signal.addEventListener("abort", () => {
    logger.info("Request aborted");
    cleanup();
  });

  try {
    const response = await sendRequest(
      cybotConfig,
      JSON.stringify(bodyData),
      signal,
      currentServer
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        await handleStreamEnd();
        break;
      }

      const text = new TextDecoder().decode(value);
      const lines = text.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;

        try {
          const data = line.substring(6);
          const jsonData = JSON.parse(data);

          switch (jsonData.type) {
            case "message_start":
              dispatch(
                updateTokens({
                  dialogId,
                  cybotConfig,
                  usage: jsonData.message.usage,
                })
              );
              dispatch(
                messageStreaming({
                  id: messageId,
                  content: "Loading...",
                  role: "assistant",
                  cybotId,
                  controller,
                })
              );
              break;

            case "content_block_delta":
              if (jsonData.delta?.text) {
                accumulatedContent += jsonData.delta.text;
                dispatch(
                  messageStreaming({
                    id: messageId,
                    content: accumulatedContent,
                    role: "assistant",
                    cybotId: cybotConfig.id,
                    controller,
                  })
                );
              }
              break;

            case "message_delta":
              dispatch(
                updateTokens({
                  dialogId,
                  cybotConfig,
                  usage: jsonData.usage,
                })
              );
              break;

            default:
              logger.info({ type: jsonData.type }, "Unhandled data type");
          }
        } catch (error) {
          logger.error({ err: error, line }, "Failed to parse stream data");
          throw error;
        }
      }
    }
  } catch (error) {
    logger.error({ err: error }, "Stream processing failed");
    await handleStreamEnd(accumulatedContent, error);
  } finally {
    cleanup();
  }
};
