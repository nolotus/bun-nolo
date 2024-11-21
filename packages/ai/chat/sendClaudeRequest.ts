import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentUserId } from "auth/authSlice";
import { getFilteredMessages } from "chat/messages/utils";
import { generateIdWithCustomId } from "core/generateMainKey";
import { ulid } from "ulid";
import { messageStreamEnd } from "chat/messages/messageSlice";
import { decodeChunk } from "ai/client/stream";
import { API_ENDPOINTS } from "database/config";
import { generateRequestBody } from "integrations/anthropic/generateRequestBody";
import {
  handlePing,
  handleMessageStart,
  handleContentBlockDelta,
  handleMessageDelta,
} from "integrations/anthropic/responseHandle";
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

// 处理日志数据
function handleLog(log, dispatch, id, cybotId, contentBuffer) {
  console.log("收到日志:", log);
  const logData = log.split("data: ")[1];
  if (logData) {
    try {
      const jsonData = JSON.parse(logData);
      console.log("解析后的数据:", jsonData);

      switch (jsonData.type) {
        case "message_start":
          return handleMessageStart(jsonData, dispatch, id, cybotId);
        case "ping":
          return handlePing();
        case "content_block_delta":
          return handleContentBlockDelta(
            jsonData,
            dispatch,
            id,
            cybotId,
            contentBuffer,
          );
        case "message_delta":
          return handleMessageDelta(jsonData, dispatch);
        default:
          console.log("未知类型的数据:", jsonData);
      }
    } catch (error) {
      console.error("解析日志数据错误:", error);
    }
  }
  return contentBuffer;
}

// 主函数
export const sendClaudeRequest = async ({ cybotConfig, content, thunkApi }) => {
  const { userId, currentServer } = getCurrentUserAndServer(thunkApi);
  const id = generateIdWithCustomId(userId, ulid(), {
    isJSON: true,
  });

  const body = generateRequestBody(
    cybotConfig,
    content,
    getFilteredMessages(thunkApi.getState()),
  );
  const controller = new AbortController();
  const signal = controller.signal;

  let contentBuffer = "";

  try {
    const response = await sendRequest(
      cybotConfig,
      body,
      signal,
      currentServer,
    );
    const reader = response.body.getReader();

    let value;

    while (true) {
      const result = await reader.read();
      value = result.value;
      if (result.done && value === undefined) {
        console.log("流已经结束");
        thunkApi.dispatch(
          messageStreamEnd({
            id,
            content: contentBuffer,
            cybotId: cybotConfig.id,
            role: "assistant", // 添加 role 属性
          }),
        );
        return;
      } else {
        console.log("流还没有结束");
      }
      if (value) {
        const text = decodeChunk(value);
        const logArray = text.split("event:");
        logArray.shift(); // 删除空字符串

        logArray.forEach((log) => {
          contentBuffer = handleLog(
            log,
            thunkApi.dispatch,
            id,
            cybotConfig.id,
            contentBuffer,
          );
        });
      }
    }
  } catch (error) {
    console.error("发送请求失败:", error);
  } finally {
    console.log("流已经结束");
    thunkApi.dispatch(
      messageStreamEnd({
        id,
        content: contentBuffer,
        cybotId: cybotConfig.id,
        role: "assistant", // 添加 role 属性
      }),
    );
    reader.releaseLock();
  }
};
