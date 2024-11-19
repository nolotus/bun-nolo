import { selectCurrentUserId } from "auth/authSlice";
import { prepareTools } from "ai/tools/prepareTools";
import { createMessages } from "ai/api/createMessages";
import { generateIdWithCustomId } from "core/generateMainKey";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { ulid } from "ulid";
import { setOne } from "database/dbSlice";

// 配置常量
const API_ENDPOINT = "https://api.x.ai/v1/chat/completions";

// 解析多行 SSE 数据
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

// 创建请求配置
const createRequestConfig = (cybotConfig, bodyData) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cybotConfig.apiKey}`,
  },
  body: JSON.stringify(bodyData),
});

// 处理流式响应
const handleStreamResponse = async (reader, decoder, messageHandler) => {
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const result = decoder.decode(value);
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
  } catch (error) {
    console.error("Stream processing error:", error);
    throw error;
  }
};

// 主函数
export const sendXaiRequest = async ({
  model,
  content,
  prevMsgs,
  cybotConfig,
  thunkApi,
}) => {
  const { dispatch, getState } = thunkApi;

  // 准备请求数据
  const messages = createMessages(model, content, prevMsgs, cybotConfig);
  const tools = prepareTools(cybotConfig.tools);
  const bodyData = { model, messages, tools, stream: true };

  // 生成消息ID
  const userId = selectCurrentUserId(getState());
  const messageId = generateIdWithCustomId(userId, ulid(), { isJSON: true });

  try {
    // 发送请求
    const response = await fetch(
      API_ENDPOINT,
      createRequestConfig(cybotConfig, bodyData),
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // 处理消息流
    await handleStreamResponse(reader, decoder, async (buffer) => {
      const message = {
        role: "assistant",
        id: messageId,
        content: buffer,
        cybotId: cybotConfig.id,
      };

      dispatch(setOne(message));
      dispatch(messageStreaming(message));
    });

    // 完成处理
    dispatch(messageStreamEnd({ id: messageId }));
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
};
