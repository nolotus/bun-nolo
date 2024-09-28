import React, { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Alert, useDeleteAlert } from "render/ui";
import { useCouldEdit } from "auth/useCouldEdit";
import { deleteCurrentDialog } from "../dialog/dialogSlice";
import { selectCostByUserId } from "ai/selectors";

import MessageInput from "./MessageInput";
import { handleSendMessage } from "./messageSlice";
import MessagesList from "./MessageList";
import ChatHeader from "../dialog/DialogHeader";

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
    dispatch(deleteCurrentDialog(currentDialogConfig));
    navigate(-1);
  }, [dispatch, currentDialogConfig, navigate]);

  const {
    visible: deleteAlertVisible,
    confirmDelete,
    doDelete,
    closeAlert,
  } = useDeleteAlert(onDeleteDialog);

  const chatContainerStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "var(--surface1)",
  };

  const messageListContainerStyle = {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  };
  const inputContainerStyle = {
    backgroundColor: "var(--surface1)",
  };

  const errorMessageStyle = {
    color: "var(--error)",
    fontSize: "14px",
    padding: "10px",
    backgroundColor: "var(--errorBg)",
    borderRadius: "4px",
    marginTop: "10px",
  };

  return (
    <div style={chatContainerStyle}>
      <ChatHeader
        currentDialogConfig={currentDialogConfig}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        allowEdit={allowEdit}
        onDeleteClick={() => confirmDelete(currentDialogConfig)}
      />
      <div style={messageListContainerStyle}>
        {currentDialogConfig.messageListId && (
          <MessagesList
            id={currentDialogConfig.messageListId}
            source={currentDialogConfig.source}
          />
        )}
      </div>
      <div style={inputContainerStyle}>
        {allowSend ? (
          <MessageInput onSendMessage={onSendMessage} />
        ) : (
          <div style={errorMessageStyle}>{t("overDueMessage")}</div>
        )}
      </div>
      {deleteAlertVisible && (
        <Alert
          isOpen={deleteAlertVisible}
          onClose={closeAlert}
          onConfirm={doDelete}
          title={t("deleteDialogTitle", { title: currentDialogConfig.title })}
          message={t("deleteDialogConfirmation")}
        />
      )}
    </div>
  );
};

export default React.memo(ChatWindow);
