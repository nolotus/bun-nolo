import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
} from "@primer/octicons-react";
import { selectCostByUserId } from "ai/selectors";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Alert, useDeleteAlert } from "render/ui";
import { useCouldEdit } from "auth/useCouldEdit";
import { deleteDialog } from "../dialog/dialogSlice";
import { patchData } from "database/dbSlice";

import MessageInput from "./MessageInput";
import { handleSendMessage } from "./messageSlice";
import MessagesList from "./MessageList";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: ${(props) => props.theme.surface1};
`;

const HeaderBar = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  background-color: ${(props) => props.theme.surface1};
`;

const DialogTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(props) => props.theme.text1};
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

const ToggleSidebarButton = styled(motion.button)`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 15px;
  padding: 0;
  transition: all 0.2s ease-in-out;
  outline: none;

  &:hover {
    background-color: ${(props) => props.theme.surface2};
  }

  &:active {
    background-color: ${(props) => props.theme.surface3};
  }

  &:focus {
    box-shadow: 0 0 0 2px ${(props) => props.theme.link};
  }

  svg {
    color: ${(props) => props.theme.text2};
  }
`;

const ErrorMessage = styled.div`
  color: ${(props) => props.theme.error};
  font-size: 14px;
  padding: 10px;
  background-color: ${(props) => props.theme.errorBg};
  border-radius: 4px;
  margin-top: 10px;
`;

const EditContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EditInput = styled.input`
  padding: 4px 8px;
  border: 1px solid ${(props) => props.theme.surface3};
  border-radius: 4px;
  font-size: 14px;
  background-color: ${(props) => props.theme.surface1};
  color: ${(props) => props.theme.text1};
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${(props) => props.theme.text2};
  border-radius: 4px;

  &:hover {
    background-color: ${(props) => props.theme.surface2};
  }
`;

const ChatWindow = ({ currentDialogConfig, toggleSidebar, isSidebarOpen }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const userCost = useAppSelector(selectCostByUserId);
  const allowSend = true; // 这里可以根据实际逻辑来设置

  const [isEditing, setEditing] = useState(false);
  const [title, setTitle] = useState(
    currentDialogConfig.title || t("newDialog"),
  );
  const [isComposing, setIsComposing] = useState(false);
  const editInputRef = useRef(null);

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

  const saveTitle = useCallback(async () => {
    if (title.trim() !== "") {
      dispatch(
        patchData({
          id: currentDialogConfig.id,
          changes: { title },
          source: currentDialogConfig.source,
        }),
      );
      setEditing(false);
    }
  }, [dispatch, title, currentDialogConfig]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setTitle(currentDialogConfig.title || t("newDialog"));
  }, [currentDialogConfig.title, t]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !isComposing) {
        e.preventDefault();
        saveTitle();
      } else if (e.key === "Escape") {
        cancelEdit();
      }
    },
    [isComposing, saveTitle, cancelEdit],
  );

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <ChatContainer>
      <HeaderBar>
        <ToggleSidebarButton
          onClick={toggleSidebar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSidebarOpen ? (
            <ChevronLeftIcon size={16} />
          ) : (
            <ChevronRightIcon size={16} />
          )}
        </ToggleSidebarButton>
        {!isEditing ? (
          <>
            <DialogTitle>{title}</DialogTitle>
            {allowEdit && (
              <EditContainer>
                <IconButton onClick={() => setEditing(true)}>
                  <PencilIcon size={14} />
                </IconButton>
                <IconButton onClick={() => confirmDelete(currentDialogConfig)}>
                  <TrashIcon size={14} />
                </IconButton>
              </EditContainer>
            )}
          </>
        ) : (
          <EditContainer>
            <EditInput
              ref={editInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
            />
            <IconButton onClick={saveTitle}>
              <CheckIcon size={14} />
            </IconButton>
            <IconButton onClick={cancelEdit}>
              <XIcon size={14} />
            </IconButton>
          </EditContainer>
        )}
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
          <ErrorMessage>{t("overDueMessage")}</ErrorMessage>
        )}
      </InputContainer>
      {deleteAlertVisible && (
        <Alert
          isOpen={deleteAlertVisible}
          onClose={closeAlert}
          onConfirm={doDelete}
          title={t("deleteDialogTitle", { title })}
          message={t("deleteDialogConfirmation")}
        />
      )}
    </ChatContainer>
  );
};

export default React.memo(ChatWindow);
