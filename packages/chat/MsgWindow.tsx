import { selectCostByUserId } from "ai/selectors";
import { useAppDispatch, useAppSelector } from "app/hooks";
import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import MessageInput from "./messages/MessageInput";
import { initMessages, handleSendMessage } from "./messages/messageSlice";
import {
  selectMessageFailed,
  selectMessageList,
  selectMessage,
} from "./messages/selector";

import { initLLMConfig } from "chat/dialog/dialogSlice";
import MessagesList from "./messages/MessageList";
import { Spinner } from "@primer/react";

const ChatWindow = ({ currentDialogConfig }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const messageFailed = useAppSelector(selectMessageFailed);
  const loading = useAppSelector((state) => state.message.messageLoading);
  useEffect(() => {
    currentDialogConfig.llmId &&
      dispatch(initLLMConfig(currentDialogConfig.llmId));

    currentDialogConfig &&
      dispatch(
        initMessages({
          messageListId: currentDialogConfig.messageListId,
          source: currentDialogConfig.source,
        }),
      );
  }, [currentDialogConfig]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  const { isMessageStreaming } = useAppSelector(selectMessage);

  let tokenCount = 0;
  const abortControllerRef = useRef(null);

  const onCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  //only handle text with stream

  const userCost = useAppSelector(selectCostByUserId);
  // const allowSend = Number(userCost.totalCost) < 2;
  const allowSend = !messageFailed;
  const onSendMessage = (content) => {
    dispatch(handleSendMessage({ content, abortControllerRef }));
  };
  const messageList = useAppSelector(selectMessageList);

  return (
    <div className="flex w-full flex-col">
      {loading && <Spinner size={"large"} />}
      {messageList?.length === 0 && <div>啥也没</div>}
      {messageList && (
        <MessagesList
          scrollToBottom={scrollToBottom}
          messageList={messageList}
        />
      )}

      {allowSend ? (
        <div className="flex-grow">
          <MessageInput
            onSendMessage={onSendMessage}
            isLoading={isMessageStreaming}
            onCancel={() => {
              dispatch(onCancel);
            }}
          />
        </div>
      ) : (
        <div>欠费大于10元，请在你的个人中心查看付费，点击你的名字</div>
      )}
    </div>
  );
};
export default ChatWindow;
