// render/ui/ChatWindow.tsx

import React, { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Alert, useDeleteAlert } from "render/ui/Alert";
import { useCouldEdit } from "auth/useCouldEdit";
import { styles } from "render/ui/styles";
import { selectTheme } from "app/theme/themeSlice";

import { deleteCurrentDialog } from "../dialog/dialogSlice";
import { selectCostByUserId } from "ai/selectors";

import MessageInput from "./MessageInput";
import { handleSendMessage } from "./messageSlice";
import MessagesList from "./MessageList";
import ChatHeader from "../dialog/DialogHeader";

interface ChatWindowProps {
  currentDialogConfig: {
    id: string;
    title: string;
    messageListId: string;
    source: string;
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentDialogConfig }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector(selectTheme);

  const userCost = useAppSelector(selectCostByUserId);
  const allowSend = true; // 这里可以根据实际逻辑来设置，比如检查 userCost

  const allowEdit = useCouldEdit(currentDialogConfig.id);

  const onSendMessage = useCallback(
    (content: string) => {
      dispatch(handleSendMessage({ content }));
    },
    [dispatch],
  );

  const onDeleteDialog = useCallback(() => {
    dispatch(deleteCurrentDialog(currentDialogConfig));
    navigate(-1);
  }, [dispatch, currentDialogConfig, navigate]);

  const {
    visible: deleteAlertVisible,
    confirmDelete,
    doDelete,
    closeAlert,
  } = useDeleteAlert(onDeleteDialog);

  const chatContainerStyle = useMemo(
    () => ({
      ...styles.flexColumn,
      ...styles.h100vh,
      ...styles.overflowXHidden,
      backgroundColor: theme.surface1,
    }),
    [theme.surface1],
  );

  const messageListContainerStyle = useMemo(
    () => ({
      ...styles.flexGrow1,
      ...styles.overflowYAuto,
      ...styles.flexColumn,
    }),
    [],
  );

  const inputContainerStyle = useMemo(
    () => ({
      backgroundColor: theme.surface1,
    }),
    [theme.surface1],
  );

  const errorMessageStyle = useMemo(
    () => ({
      color: theme.error,
      ...styles.fontSize14,
      ...styles.p1,
      backgroundColor: theme.errorBg,
      ...styles.roundedSm,
      ...styles.mt2,
    }),
    [theme.error, theme.errorBg],
  );

  return (
    <div style={chatContainerStyle}>
      <ChatHeader
        currentDialogConfig={currentDialogConfig}
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
      <Alert
        isOpen={deleteAlertVisible}
        onClose={closeAlert}
        onConfirm={doDelete}
        title={t("deleteDialogTitle", { title: currentDialogConfig.title })}
        message={t("deleteDialogConfirmation")}
      />
    </div>
  );
};

export default React.memo(ChatWindow);
