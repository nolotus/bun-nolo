// chat/web/MessageInputContainer.tsx
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { selectCurrentUserId } from "auth/authSlice";
import type React from "react";
import { useSendPermission } from "../hooks/useSendPermission";
import MessageInput from "./MessageInput";
import { handleSendMessage } from "../messages/messageSlice";
import { useBalance } from "auth/hooks/useBalance";
import { nolotusId } from "core/init";

const SKIP_BALANCE_CHECK_IDS = [
  nolotusId,
  "Y25UeEg1VlNTanIwN2N0d1Mzb3NLRUQ3dWhzWl9hdTc0R0JoYXREeWxSbw",
];

const MessageInputContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const userId = useAppSelector(selectCurrentUserId);
  const shouldSkipBalanceCheck = SKIP_BALANCE_CHECK_IDS.includes(userId);

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

  if (shouldSkipBalanceCheck) {
    return <MessageInput onSendMessage={onSendMessage} />;
  }

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
          {getErrorMessage(sendPermission.reason, sendPermission.pricing)}
        </div>
      )}
    </div>
  );
};

export default MessageInputContainer;
