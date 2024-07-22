import { ChevronLeftIcon, ChevronRightIcon } from "@primer/octicons-react";
import { selectCostByUserId } from "ai/selectors";
import { useAppDispatch, useAppSelector } from "app/hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import styled from "styled-components";

import MessageInput from "./MessageInput";
import { handleSendMessage } from "./messageSlice";
import MessagesList from "./MessageList";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const HeaderBar = styled.div`
  padding: 15px;
  background-color: white;
  z-index: 10;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
`;

const DialogTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
`;

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  padding: 10px;
`;

const ToggleSidebarButton = ({ toggleSidebar, isSidebarOpen }) => {
  return (
    <motion.button
      onClick={toggleSidebar}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="mr-4 rounded-full bg-blue-500 p-2 text-white"
      style={{ width: "32px", height: "32px" }}
    >
      {isSidebarOpen ? (
        <ChevronLeftIcon size={16} />
      ) : (
        <ChevronRightIcon size={16} />
      )}
    </motion.button>
  );
};

const ChatWindow = ({ currentDialogConfig, toggleSidebar, isSidebarOpen }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const userCost = useAppSelector(selectCostByUserId);
  const allowSend = true;

  const onSendMessage = (content) => {
    dispatch(handleSendMessage({ content }));
  };

  return (
    <ChatContainer>
      <HeaderBar>
        <ToggleSidebarButton
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <DialogTitle>{currentDialogConfig.title || "新对话"}</DialogTitle>
      </HeaderBar>
      <MessageListContainer>
        {currentDialogConfig.messageListId && (
          <MessagesList
            id={currentDialogConfig.messageListId}
            source={currentDialogConfig.source}
          />
        )}
      </MessageListContainer>
      <InputContainer>
        {allowSend ? (
          <MessageInput onSendMessage={onSendMessage} />
        ) : (
          <div>欠费大于10元，请在你的个人中心查看付费，点击你的名字</div>
        )}
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatWindow;
