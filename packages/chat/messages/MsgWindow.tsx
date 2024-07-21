import { selectCostByUserId } from "ai/selectors";
import { useAppDispatch, useAppSelector } from "app/hooks";
import React from "react";
import { useTranslation } from "react-i18next";

import MessageInput from "./MessageInput";
import { handleSendMessage } from "./messageSlice";
import MessagesList from "./MessageList";
import { messageWindowStyle } from "./styles";

const ChatWindow = ({ currentDialogConfig }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const userCost = useAppSelector(selectCostByUserId);
  // const allowSend = Number(userCost.totalCost) < 2;

  const allowSend = true;
  const onSendMessage = (content) => {
    dispatch(handleSendMessage({ content }));
  };

  return (
    <div style={messageWindowStyle}>
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
