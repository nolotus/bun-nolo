import React, { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTranslation } from "react-i18next";
import { styles } from "render/ui/styles";
import { selectTheme } from "app/theme/themeSlice";

import { selectCostByUserId } from "ai/selectors";

import MessageInput from "./MessageInput";
import { handleSendMessage } from "./messageSlice";
import MessagesList from "./MessageList";

const ChatWindow: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  const userCost = useAppSelector(selectCostByUserId);
  const allowSend = true; // 这里可以根据实际逻辑来设置，比如检查 userCost

  const onSendMessage = useCallback(
    (content: string) => {
      dispatch(handleSendMessage({ content }));
    },
    [dispatch],
  );

  const chatContainerStyle = useMemo(
    () => ({
      ...styles.flexColumn,
      ...styles.h100,
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
      <div style={messageListContainerStyle}>
        <MessagesList />
      </div>
      <div style={inputContainerStyle}>
        {allowSend ? (
          <MessageInput onSendMessage={onSendMessage} />
        ) : (
          <div style={errorMessageStyle}>{t("overDueMessage")}</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatWindow);
