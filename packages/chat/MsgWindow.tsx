import { selectCostByUserId } from "ai/selectors";
import { useAppDispatch, useAppSelector } from "app/hooks";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import MessageInput from "./messages/MessageInput";
import { handleSendMessage } from "./messages/messageSlice";

import { initLLMConfig } from "chat/dialog/dialogSlice";
import MessagesList from "./messages/MessageList";

const ChatWindow = ({ currentDialogConfig }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  useEffect(() => {
    currentDialogConfig.llmId &&
      dispatch(initLLMConfig(currentDialogConfig.llmId));
  }, [currentDialogConfig]);

  const userCost = useAppSelector(selectCostByUserId);
  // const allowSend = Number(userCost.totalCost) < 2;

  const allowSend = true;
  const onSendMessage = (content) => {
    dispatch(handleSendMessage({ content }));
  };

  return (
    <div className="flex w-full flex-col">
      {currentDialogConfig.messageListId && (
        <MessagesList
          id={currentDialogConfig.messageListId}
          source={currentDialogConfig.source}
        />
      )}
      {allowSend ? (
        <div className="flex-grow">
          <MessageInput onSendMessage={onSendMessage} />
        </div>
      ) : (
        <div>欠费大于10元，请在你的个人中心查看付费，点击你的名字</div>
      )}
    </div>
  );
};
export default ChatWindow;
