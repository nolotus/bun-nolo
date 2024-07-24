import React, { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Alert, useDeleteAlert } from "render/ui";
import { useCouldEdit } from "auth/useCouldEdit";
import { deleteDialog } from "../dialog/dialogSlice";
import { selectCostByUserId } from "ai/selectors";

import MessageInput from "./MessageInput";
import { handleSendMessage } from "./messageSlice";
import MessagesList from "./MessageList";
import ChatHeader from "./ChatHeader";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: ${(props) => props.theme.surface1};
`;

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 0 20px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.scrollthumbColor};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.text2};
  }
`;

const InputContainer = styled.div`
  padding: 20px;
  background-color: ${(props) => props.theme.surface1};
`;

const ErrorMessage = styled.div`
  color: ${(props) => props.theme.error};
  font-size: 14px;
  padding: 10px;
  background-color: ${(props) => props.theme.errorBg};
  border-radius: 4px;
  margin-top: 10px;
`;

const ChatWindow = ({ currentDialogConfig, toggleSidebar, isSidebarOpen }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const userCost = useAppSelector(selectCostByUserId);
  const allowSend = true; // 这里可以根据实际逻辑来设置

  const allowEdit = useCouldEdit(currentDialogConfig.id);

  const onSendMessage = useCallback(
    (content) => {
      dispatch(handleSendMessage({ content }));
    },
    [dispatch],
  );

  const onDeleteDialog = useCallback(async () => {
    dispatch(deleteDialog(currentDialogConfig));
    navigate("/chat");
  }, [dispatch, currentDialogConfig, navigate]);

  const {
    visible: deleteAlertVisible,
    confirmDelete,
    doDelete,
    closeAlert,
  } = useDeleteAlert(onDeleteDialog);

  return (
    <ChatContainer>
      <ChatHeader
        currentDialogConfig={currentDialogConfig}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        allowEdit={allowEdit}
        onDeleteClick={() => confirmDelete(currentDialogConfig)}
      />
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
          <ErrorMessage>{t("overDueMessage")}</ErrorMessage>
        )}
      </InputContainer>
      {deleteAlertVisible && (
        <Alert
          isOpen={deleteAlertVisible}
          onClose={closeAlert}
          onConfirm={doDelete}
          title={t("deleteDialogTitle", { title: currentDialogConfig.title })}
          message={t("deleteDialogConfirmation")}
        />
      )}
    </ChatContainer>
  );
};

export default React.memo(ChatWindow);
