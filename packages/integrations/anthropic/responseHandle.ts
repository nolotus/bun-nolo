import { updateInputTokens, updateOutputTokens } from "chat/dialog/dialogSlice";
import { setOne } from "database/dbSlice";
import { messageStreaming } from "chat/messages/messageSlice";

// 处理心跳数据
export function handlePing() {
  return "";
}

// 处理消息开始的数据
export function handleMessageStart(data, dispatch, id, cybotId) {
  const inputTokens = data.message.usage.input_tokens;
  dispatch(updateInputTokens(inputTokens));

  const message = {
    id,
    content: "Loading...",
    role: "assistant",
    cybotId,
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
) {
  const contentBlockIndex = data.index;
  const textDelta = data.delta.text;
  contentBuffer += textDelta;

  const message = {
    id,
    content: contentBuffer,
    role: "assistant",
    cybotId,
  };
  dispatch(setOne(message));
  dispatch(messageStreaming(message));
  return contentBuffer;
}

// 处理消息更新的数据
export function handleMessageDelta(data, dispatch) {
  const outputTokens = data.delta.usage.output_tokens;
  dispatch(updateOutputTokens(outputTokens));
  return "";
}
