// useStreamHandler.ts
import { useState } from "react";
import { getLogger } from "utils/logger";
import { tokenStatic } from "ai/client/static";
import { sendRequestToOpenAI } from "ai/client/request";
import { useAppDispatch } from "app/hooks";
import { receiveMessage ,clearMessages } from "./chatSlice";

const chatWindowLogger = getLogger("ChatWindow"); // 初始化日志

export const useStreamHandler = (config,userId, username) => {
  const dispatch =useAppDispatch()
  const [tempMessages, setTempMessages] = useState({
    role: "assistant",
    id: "",
    content: "",
  });
  const [isStopped, setIsStopped] = useState(false);

  let temp;
  let tokenCount = 0;
  const handleStreamData = (data) => {
    const text = new TextDecoder("utf-8").decode(data);
    const lines = text.trim().split("\n");
    lines.forEach((line) => {
      // 使用正则表达式匹配 "data:" 后面的内容
      const match = line.match(/data: (done|{.*}|)/);

      if (match && match[1] !== undefined) {
        const statusOrJson = match[1];
        if (statusOrJson === "" || statusOrJson === "done") {
          chatWindowLogger.info(
            statusOrJson === ""
              ? "Received gap (empty string)"
              : "Received done"
          );
        } else {
          try {
            const json = JSON.parse(statusOrJson);
            // 自然停止
            const finishReason = json.choices[0].finish_reason;
            if (finishReason === "stop") {
              dispatch(receiveMessage( { role: "assistant", content: temp }))
              
              setTempMessages({ role: "", id: "", content: "" });
              const staticData = {
                dialogType: "receive",
                model: json.model,
                length: tokenCount,
                chatId: json.id,
                chatCreated: json.created,
                userId,
                username,
              };
              tokenStatic(staticData);
              tokenCount = 0; // 重置计数器
            } else if (
              finishReason === "length" ||
              finishReason === "content_filter"
            ) {
              setIsStopped(true);
            } else if (finishReason === "function_call") {
              // nerver use just sign it
            } else {
              temp = (temp || "") + (json.choices[0]?.delta?.content || "");

              setTempMessages({
                role: "assistant",
                id: json.id,
                content: temp,
              });
            }
            if (json.choices[0]?.delta?.content) {
              tokenCount++; // 单次计数
            }
          } catch (e) {
            chatWindowLogger.error({ error: e }, "Error parsing JSON");
          }
        }
      }
    });
  };

  const handleStreamMessage = async (newMessage, prevMessages) => {
    await sendRequestToOpenAI(
      "stream",
      {
        userMessage: newMessage,
        prevMessages: prevMessages,
      },
      config,
      handleStreamData // 传递回调函数
    );
  };
  const clear = () => {
    dispatch(clearMessages())
    setTempMessages({ role: "assistant", id: "", content: "" });
  };

  return {
    tempMessages,
    handleStreamMessage,
    clear,
    isStopped,
    setIsStopped,
    setTempMessages,
  };
};
