import { messageStreamEnd, messageStreaming } from "chat/messages/messageSlice";
import { setOne } from "database/dbSlice";

export const handleOllamaResponse = async (
  id,
  cybotId,
  result,
  thunkApi,
  controller,
) => {
  const reader = result.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let temp;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // 处理缓冲区中的完整 JSON 对象
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const chunk = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (chunk.trim().length > 0) {
        try {
          const jsonData = JSON.parse(chunk);
          //todo  add open or close
          // console.log("Received data:", jsonData);
          const { done } = jsonData;
          temp = (temp || "") + (jsonData.message.content || "");
          if (done) {
            thunkApi.dispatch(
              messageStreamEnd({
                id,
                content: temp,
                cybotId,
              }),
            );
          } else {
            const message = {
              role: "assistant",
              id,
              content: temp,
              cybotId,
            };
            thunkApi.dispatch(setOne(message));
            thunkApi.dispatch(messageStreaming({ ...message, controller }));
          }
          // 在这里处理您的 JSON 数据
          // 例如：更新UI，存储数据等
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    }
  }

  // 处理最后可能剩余的数据
  if (buffer.trim().length > 0) {
    try {
      const jsonData = JSON.parse(buffer);
      console.log("Final data:", jsonData);
      // 处理最后的 JSON 数据
    } catch (error) {
      console.error("Error parsing final JSON:", error);
    }
  }
};
