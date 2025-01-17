// chat/web/MessageInputContainer.tsx
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useSendPermission } from "../hooks/useSendPermission";
import MessageInput from "./MessageInput";
import { handleSendMessage } from "../messages/messageSlice";
import { useBalance } from "auth/hooks/useBalance";

const MessageInputContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const { balance, loading, error: balanceError } = useBalance();
  const { sendPermission, getErrorMessage } = useSendPermission(balance);

  const onSendMessage = (content: string) => {
    dispatch(handleSendMessage({ content }));
  };

  const errorMessageStyle = {
    color: theme.error,
    fontSize: "14px",
    padding: ".5rem 1rem",
    backgroundColor: theme.errorBg,
    borderRadius: "4px",
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 1px 3px ${theme.shadowColor}`,
    border: `1px solid ${theme.error}20`,
  };

  if (loading) {
    return <div style={errorMessageStyle}>加载中...</div>;
  }

  if (balanceError) {
    return <div style={errorMessageStyle}>{balanceError}</div>;
  }

  return (
    <div>
      {sendPermission.allowed ? (
        <MessageInput onSendMessage={onSendMessage} />
      ) : (
        <div style={errorMessageStyle}>
          {getErrorMessage(
            sendPermission.reason,
            sendPermission.requiredAmount
          )}
        </div>
      )}
    </div>
  );
};

export default MessageInputContainer;
