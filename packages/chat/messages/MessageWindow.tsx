import { selectCostByUserId } from "ai/selectors";
import { useAppDispatch, useAppSelector } from "app/hooks";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "ui";

import MessageInput from "./MessageInput";
import {
  retry,
  continueMessage,
  initMessages,
  handleSendMessage,
} from "./messageSlice";
import { selectMessage } from "./selector";

import { initLLMConfig } from "chat/dialog/dialogSlice";
import MessagesList from "./MessageList";

const ChatWindow = ({ currentDialogConfig }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    currentDialogConfig.llmId &&
      dispatch(initLLMConfig(currentDialogConfig.llmId));
    currentDialogConfig.messageListId &&
      dispatch(initMessages(currentDialogConfig.messageListId));
  }, [currentDialogConfig]);

  const messages = useAppSelector((state) => state.message.messages);
  const messageIds = useAppSelector((state) => state.message.ids);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };
  const [requestFailed, setRequestFailed] = useState(false);

  const { isMessageStreaming, isStopped } = useAppSelector(selectMessage);

  let tokenCount = 0;
  const abortControllerRef = useRef(null);

  const onCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  //only handle text with stream

  // const handleSendMessage = async (textContent: string, message: Message) => {
  //   setRequestFailed(false);
  // };

  const handleRetry = async () => {
    const lastMessage = messages[messages.length - 1];
    dispatch(retry());
    if (lastMessage && lastMessage.role === "user") {
      dispatch(handleSendMessage(lastMessage.content));
    }
  };
  // const handleContinue = async () => {
  //   // 移除第一条消息
  //   const newMessages = messages.slice(1);
  //   dispatch(continueMessage(newMessages));

  //   // 发送新的请求
  //   if (newMessages.length > 0) {
  //     const lastUserMessage = newMessages[newMessages.length - 1].content;
  //     if (lastUserMessage) {
  //       await handleStreamMessage(lastUserMessage, newMessages);
  //     }
  //   }
  // };
  const userCost = useAppSelector(selectCostByUserId);
  // const allowSend = Number(userCost.totalCost) < 2;
  const allowSend = true;
  const onSendMessage = (content) => {
    dispatch(handleSendMessage({ content, abortControllerRef }));
  };
  return (
    <div className="flex h-full w-full flex-col lg:w-5/6">
      {/* <MessagesDisplay messages={messages} scrollToBottom={scrollToBottom} /> */}
      {messageIds && (
        <MessagesList messageIds={messageIds} scrollToBottom={scrollToBottom} />
      )}

      {allowSend ? (
        <div className="flex items-center p-4">
          <div className="flex-grow">
            <MessageInput
              onSendMessage={onSendMessage}
              isLoading={isMessageStreaming}
              onCancel={() => {
                dispatch(onCancel);
              }}
            />
          </div>
          <div className="ml-2 flex space-x-2">
            {requestFailed && (
              <Button onClick={handleRetry} className="p-1 text-sm">
                重试
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div>欠费大于10元，请在你的个人中心查看付费，点击你的名字</div>
      )}

      {/* {isStopped && <Button onClick={handleContinue}>继续</Button>} */}
    </div>
  );
};
export default ChatWindow;
