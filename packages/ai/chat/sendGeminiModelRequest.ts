import { read, setOne } from "database/dbSlice";
import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { updateInputTokens, updateOutputTokens } from "chat/dialog/dialogSlice";
import { sendNoloChatRequest } from "chat/messages/chatStreamRequest";
import { selectCurrentServer } from "setting/settingSlice";
import { createStreamRequestBody } from "./createStreamRequestBody";
import { getFilteredMessages } from "chat/messages/utils";
import { decodeChunk } from "ai/client/stream";
import { generateIdWithCustomId } from "core/generateMainKey";
import { ulid } from "ulid";
import { selectCurrentUserId } from "auth/authSlice";

export const sendGeminiModelRequest = async (
  dialogConfig,
  content,
  thunkApi,
) => {
  const dispatch = thunkApi.dispatch;
  const state = thunkApi.getState();
  const userId = selectCurrentUserId(state);
  const currentServer = selectCurrentServer(state);
  console.log("dialogConfig", dialogConfig);

  const cybotId = dialogConfig.cybots
    ? dialogConfig.cybots[0]
    : dialogConfig.llmId;
  console.log("cybotId", cybotId);

  const readAction = await dispatch(read({ id: cybotId }));
  console.log("readAction", readAction);

  const cybotConfig = readAction.payload;
  console.log("cybotConfig", cybotConfig);

  const config = {
    ...cybotConfig,
    responseLanguage: navigator.language,
  };
  let previousMessages = getFilteredMessages(state);

  const requestBody = createStreamRequestBody(
    config,
    content,
    previousMessages,
  );

  const controller = new AbortController();
  const signal = controller.signal;
  const token = state.auth.currentToken;

  const response = await sendNoloChatRequest({
    currentServer,
    requestBody,
    signal,
    token,
  });

  const reader = response.body.getReader();

  const id = generateIdWithCustomId(userId, ulid(), {
    isJSON: true,
  });

  // 创建闭包，每个请求对应一个独立的 temp
  let temp = "";

  let value: Uint8Array | undefined;

  try {
    while (true) {
      const result = await reader.read();
      value = result.value;
      if (result.done) {
        dispatch(
          messageStreamEnd({
            id,
            content: temp,
            cybotId,
          }),
        );
        return;
      }
      if (value) {
        console.log(temp);
        const text = decodeChunk(value);

        // 调用 handleGeminiModelStreamResponse，并传入 temp
        temp = handleGeminiModelStreamResponse(
          text,
          id,
          cybotId,
          temp,
          thunkApi,
          controller,
        );
      }
    }
  } catch (err) {
    // handleError(err, value);
  } finally {
    reader.releaseLock();
  }
};

function handleGeminiModelStreamResponse(
  text,
  id,
  cybotId,
  temp, // 接收 temp 参数
  thunkApi,
  controller,
) {
  try {
    console.log("[handleGeminiModelResponse] 开始处理响应:", text);

    // 去掉 "data: " 前缀，提取真正的 JSON 字符串部分
    const jsonString = text.slice(text.indexOf("{"));

    const json = JSON.parse(jsonString);
    console.log("[JSON 解析] 原始 JSON:", json);

    if (json.candidates) {
      json.candidates.forEach((candidate) => {
        console.log("[候选者] 当前候选者内容:", candidate);

        if (candidate.content && candidate.content.parts) {
          const textContent = candidate.content.parts
            .map((part) => part.text)
            .join(" ");
          console.log("[文本内容] 候选者内容合并后的文本:", textContent);

          // 允许空白字符通过，只需确保文本内容非空
          temp += textContent;
        }
      });

      const message = {
        role: "assistant",
        id,
        content: temp,
        cybotId,
      };

      // 确认内容非空
      if (temp !== "") {
        console.log("[消息发送] 发送消息到数据库:", message);
        thunkApi.dispatch(setOne(message));
        console.log("[消息流] 消息流处理:", { ...message, controller });
        thunkApi.dispatch(messageStreaming({ ...message, controller }));
      } else {
        console.log("[消息发送] 跳过无效消息，未写入数据库。");
      }
    }

    if (json.usageMetadata) {
      thunkApi.dispatch(updateInputTokens(json.usageMetadata.promptTokenCount));
      thunkApi.dispatch(updateOutputTokens(json.usageMetadata.totalTokenCount));
    }
  } catch (e) {
    console.error("[错误] 解析 JSON 失败:", e);
  }

  console.log("[返回值] 最终的 temp 值:", temp);

  // 返回更新后的 temp
  return temp;
}
