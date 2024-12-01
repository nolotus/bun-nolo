import { updateInputTokens, updateOutputTokens } from "chat/dialog/dialogSlice";
import { setOne } from "database/dbSlice";
import { messageStreaming } from "chat/messages/messageSlice";

// 处理心跳数据
export function handlePing(contentBuffer) {
  // 直接返回入参contentBuffer，而不是返回空字符串
  return contentBuffer;
}

// 处理消息开始的数据
export function handleMessageStart(data, dispatch, id, cybotId, controller) {
  const inputTokens = data.message.usage.input_tokens;
  dispatch(updateInputTokens(inputTokens));

  const message = {
    id,
    content: "Loading...",
    role: "assistant",
    cybotId,
    controller,
  };
  dispatch(setOne(message));
  dispatch(messageStreaming(message));
  return "";
}

// 处理内容块更新的数据
export function handleContentBlockDelta(
  data,
  dispatch,
  id,
  cybotId,
  contentBuffer,
  controller,
) {
  try {
    const textDelta = data.delta.text;
    if (!textDelta) {
      console.warn("Empty delta text received");
      return contentBuffer;
    }

    // 保存之前的长度用于调试
    const previousLength = contentBuffer.length;
    contentBuffer += textDelta;

    console.debug(
      `Buffer update: ${previousLength} -> ${contentBuffer.length}`,
    );

    const message = {
      id,
      content: contentBuffer,
      role: "assistant",
      cybotId,
      controller,
    };

    // 确保消息内容被正确保存
    dispatch(setOne(message));
    dispatch(messageStreaming(message));

    return contentBuffer;
  } catch (error) {
    console.error("Error in handleContentBlockDelta:", error);
    return contentBuffer;
  }
}

// 处理消息更新的数据
export function handleMessageDelta(data, dispatch) {
  const outputTokens = data.delta.usage.output_tokens;
  dispatch(updateOutputTokens(outputTokens));
  return "";
}
