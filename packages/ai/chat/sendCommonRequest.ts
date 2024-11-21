import { createMessages } from "ai/api/createMessages";
import { prepareTools } from "ai/tools/prepareTools";
import { selectCurrentUserId } from "auth/authSlice";
import { generateIdWithCustomId } from "core/generateMainKey";
import { ulid } from "ulid";
import { setOne } from "database/dbSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { getFilteredMessages } from "chat/messages/utils";
import { DEEPINFRA_API_ENDPOINT } from "integrations/deepinfra/chatRequest";
import { FIREWORKS_API_ENDPOINT } from "integrations/fireworks/chatRequest";
import { XAI_API_ENDPOINT } from "integrations/xai/chatRequest";
import { selectCurrentServer } from "setting/settingSlice";
import { API_ENDPOINTS } from "database/config";

function parseMultilineSSE(rawText) {
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

const createRequestConfig = (cybotConfig, bodyData, signal) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cybotConfig.apiKey}`,
  },
  body: JSON.stringify(bodyData),
  signal,
});

export const sendCommonChatRequest = async ({
  content,
  cybotConfig,
  thunkApi,
}) => {
  const { dispatch, getState } = thunkApi;

  const prevMsgs = getFilteredMessages(thunkApi.getState());
  const controller = new AbortController();
  const signal = controller.signal;
  const currentServer = selectCurrentServer(getState());

  // 准备请求数据
  const messages = createMessages(content, prevMsgs, cybotConfig);
  const tools = prepareTools(cybotConfig.tools);
  const model = cybotConfig.model;
  const bodyData = { model, messages, tools, stream: true };

  // 生成消息ID
  const userId = selectCurrentUserId(getState());
  const messageId = generateIdWithCustomId(userId, ulid(), { isJSON: true });

  let contentBuffer = "";
  let reader;

  try {
    // 初始化加载状态
    const message = {
      id: messageId,
      content: "Loading...",
      role: "assistant",
      cybotId: cybotConfig.id,
      controller,
    };
    dispatch(setOne(message));
    dispatch(messageStreaming(message));

    let api;
    if (cybotConfig.provider === "deepinfra") {
      api = DEEPINFRA_API_ENDPOINT;
    }
    if (cybotConfig.provider === "fireworks") {
      api = FIREWORKS_API_ENDPOINT;
    }
    if (cybotConfig.provider === "xai") {
      api = XAI_API_ENDPOINT;
    }

    let response;
    if (!cybotConfig.useServerProxy) {
      response = await fetch(
        api,
        createRequestConfig(cybotConfig, bodyData, signal),
      );
    } else {
      response = await fetch(`${currentServer}${API_ENDPOINTS.PROXY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bodyData,
          url: api,
          KEY: cybotConfig.apiKey,
        }),
        signal,
      });
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // 流结束时发送最终消息
        dispatch(
          messageStreamEnd({
            id: messageId,
            content: contentBuffer,
            role: "assistant",
            cybotId: cybotConfig.id,
          }),
        );
        break;
      }

      const result = decoder.decode(value);
      const parsedResults = parseMultilineSSE(result);

      for (const parsedData of parsedResults) {
        const content = parsedData.choices?.[0]?.delta?.content || "";
        if (content) {
          contentBuffer += content;
          // 更新当前消息内容
          dispatch(
            setOne({
              id: messageId,
              content: contentBuffer,
              role: "assistant",
              cybotId: cybotConfig.id,
              controller,
            }),
          );
          dispatch(
            messageStreaming({
              id: messageId,
              content: contentBuffer,
              role: "assistant",
              cybotId: cybotConfig.id,
            }),
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
      }),
    );
    throw error;
  } finally {
    // 确保在结束时释放reader
    if (reader) {
      reader.releaseLock();
    }
  }
};
