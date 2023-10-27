import React, { useState, useRef } from "react";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import { Icon, Button } from "ui";
import { getLogger } from "utils/logger";
import { useAppDispatch, useAppSelector, useAuth } from "app/hooks";

import { tokenStatic } from "ai/client/static";
import { calcCurrentUserIdCost } from "ai/utils/calcCost";
import aiTranslations from "ai/aiI18n";
import { sendRequestToOpenAI } from "ai/client/request";

import chatTranslations from "./chatI18n";

import ChatSidebar from "./blocks/ChatSidebar";
import MessagesDisplay from "./blocks/MessagesDisplay";
import MessageInput from "./blocks/MessageInput";

import { useStreamHandler } from "./useStreamHandler";
import {
  receiveMessage,
  sendMessage,
  selectChat,
  retry,
  clearMessages,
  continueMessage,
  messageEnd,
} from "./chatSlice";

const chatWindowLogger = getLogger("ChatWindow"); // 初始化日志
// Object.keys(chatTranslations).forEach((lang) => {
//   const translations = chatTranslations[lang].translation;
//   i18n.addResourceBundle(lang, "translation", translations, true, true);
// });
// Object.keys(aiTranslations).forEach((lang) => {
//   const translations = aiTranslations[lang].translation;
//   i18n.addResourceBundle(lang, "translation", translations, true, true);
// });

const ChatPage = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();

  const allowSend = useAppSelector((state) => state.chat.allowSend);
  const messages = useAppSelector((state) => state.chat.messages);

  const { t } = useTranslation();

  const [cost, setCost] = useState(0);

  // const allowSend = Number(cost.totalCost) < 2;
  let username;

  if (auth.user) {
    username = auth.user.username;
  }
  // useEffect(() => {
  //   const fetchCost = async () => {
  //     const options = {
  //       isJSON: true,
  //       condition: {
  //         $eq: { type: "tokenStatistics" },
  //       },
  //       limit: 1000,
  //     };

  //     const result = await queryData(nolotusId, options);
  //     const currentUserIdCost = calcCurrentUserIdCost(
  //       result,
  //       auth?.user?.userId
  //     );
  //     console.log("result", result);
  //     console.log("currentUserIdCost", currentUserIdCost);
  //     setCost(currentUserIdCost);
  //   };

  //   auth?.user?.userId && fetchCost();
  // }, [auth?.user?.userId]);
  const { currentChatConfig, isStopped, isMessageStreaming } =
    useAppSelector(selectChat);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  const [requestFailed, setRequestFailed] = useState(false);

  const [setIsLoading] = useState(false);

  const [mode] = useState<"text" | "image" | "stream">("stream");

  const { handleStreamMessage } = useStreamHandler(
    currentChatConfig,
    auth?.user?.userId,
    username
  );
  const handleSendMessage = async (newContent) => {
    if (!newContent.trim()) return;
    setRequestFailed(false);
    dispatch(sendMessage({ role: "user", content: newContent }));
    try {
      let assistantMessage;
      if (mode === "text") {
        assistantMessage = await sendRequestToOpenAI(
          "text",
          {
            userMessage: newContent,
            prevMessages: messages,
          },
          currentChatConfig
        );
        dispatch(
          receiveMessage({ role: "assistant", content: assistantMessage })
        );
      } else if (mode === "image") {
        const imageData = await sendRequestToOpenAI(
          "image",
          {
            prompt: newContent,
          },
          currentChatConfig
        );
        const imageUrl = imageData.data[0].url; // 提取图片 URL

        dispatch(
          receiveMessage({
            role: "assistant",
            content: "Here is your generated image:",
            image: imageUrl, // 使用提取出的图片 URL
          })
        );
      }
      if (mode === "stream") {
        await handleStreamMessage(newContent, messages);
        const staticData = {
          dialogType: "send",
          model: currentChatConfig?.model,
          length: newContent.length,
          userIdL: auth?.user?.userId,
          username: auth?.user?.username,
          date: new Date(),
        };
        tokenStatic(staticData);
      }
    } catch (error) {
      chatWindowLogger.error({ error }, "Error while sending message");
      setRequestFailed(true);
    } finally {
      dispatch(messageEnd);
    }
  };

  const handleContinue = async () => {
    // 移除第一条消息
    const newMessages = messages.slice(1);
    dispatch(continueMessage(newMessages));

    // 发送新的请求
    if (newMessages.length > 0) {
      const lastUserMessage = newMessages[newMessages.length - 1].content;
      if (lastUserMessage) {
        await handleStreamMessage(lastUserMessage, newMessages);
      }
    }
  };
  const handleRetry = async () => {
    const lastMessage = messages[messages.length - 1];
    dispatch(retry());
    // 使用 handleSendMessage 重新发送最后一条消息
    if (lastMessage && lastMessage.role === "user") {
      await handleSendMessage(lastMessage.content);
    }
  };
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-60px)]">
      {/* Config Panel and Toggle Button */}
      <div className="hidden lg:block lg:w-1/6 bg-gray-200 overflow-y-auto">
        <ChatSidebar />
      </div>

      {/* Chat Window */}
      <div className="w-full lg:w-5/6 flex flex-col h-full">
        <MessagesDisplay messages={messages} scrollToBottom={scrollToBottom} />
        {allowSend ? (
          <div className="p-4 flex items-center">
            <div className="flex-grow">
              <MessageInput
                onSendMessage={handleSendMessage}
                isLoading={isMessageStreaming}
              />
            </div>
            <div className="ml-2 flex space-x-2">
              <Button
                onClick={() => dispatch(clearMessages())}
                icon={<Icon name="trash" />}
                className="text-sm p-1"
              >
                {t("clearChat")}
              </Button>
              {requestFailed && (
                <Button onClick={handleRetry} className="text-sm p-1">
                  重试
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>欠费大于10元，请在你的个人中心查看付费，点击你的名字</div>
        )}

        {isStopped && <Button onClick={handleContinue}>继续</Button>}
      </div>
    </div>
  );
};

export default ChatPage;
