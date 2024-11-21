import { createMessages } from "ai/api/createMessages";
import { prepareTools } from "ai/tools/prepareTools";
import { selectCurrentUserId } from "auth/authSlice";
import { generateIdWithCustomId } from "core/generateMainKey";
import { ulid } from "ulid";
import { setOne } from "database/dbSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";

const DEEPINFRA_API_ENDPOINT =
  "https://api.deepinfra.com/v1/openai/chat/completions";

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
const handleStreamResponse = async (reader, decoder, messageHandler) => {
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const result = decoder.decode(value);
      console.log("result", result);
      const parsedResults = parseMultilineSSE(result);

      // 处理所有解析出的消息
      for (const parsedData of parsedResults) {
        const content = parsedData.choices?.[0]?.delta?.content || "";
        if (content) {
          buffer += content;
          await messageHandler(buffer);
        }
      }
    }
    return buffer; // 返回完整的消息内容
  } catch (error) {
    console.error("Stream processing error:", error);
    throw error;
  }
};

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
  prevMsgs,
  cybotConfig,
  thunkApi,
}) => {
  const { dispatch, getState } = thunkApi;
  const controller = new AbortController();
  const signal = controller.signal;

  // 准备请求数据
  const messages = createMessages(model, content, prevMsgs, cybotConfig);
  const tools = prepareTools(cybotConfig.tools);
  const model = cybotConfig.model;
  const bodyData = { model, messages, tools, stream: true };

  // 生成消息ID
  const userId = selectCurrentUserId(getState());
  const messageId = generateIdWithCustomId(userId, ulid(), { isJSON: true });

  try {
    // 使用 messageStreaming 来显示加载状态
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
    // 发送请求
    const response = await fetch(
      api,
      createRequestConfig(cybotConfig, bodyData, signal),
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // 处理消息流
    const finalContent = await handleStreamResponse(
      reader,
      decoder,
      async (buffer) => {
        const message = {
          id: messageId,
          content: buffer,
          role: "assistant",
          cybotId: cybotConfig.id,
          controller,
        };

        dispatch(setOne(message));
        dispatch(messageStreaming(message));
      },
    );

    // 完成处理 - 传递完整的消息内容
    dispatch(
      messageStreamEnd({
        id: messageId,
        content: finalContent,
        role: "assistant",
        cybotId: cybotConfig.id,
      }),
    );
  } catch (error) {
    console.error("Request failed:", error);
    // 使用 messageStreaming 来显示错误状态
    dispatch(
      messageStreaming({
        id: messageId,
        content: "Error: " + error.message,
        role: "assistant",
        cybotId: cybotConfig.id,
      }),
    );
    throw error;
  }
};
