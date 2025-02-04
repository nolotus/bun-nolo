// chat/web/MessageInputContainer.tsx
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useSendPermission } from "../hooks/useSendPermission";
import MessageInput from "./MessageInput";
import { handleSendMessage } from "../messages/messageSlice";
import { useBalance } from "auth/hooks/useBalance";
import toast from "react-hot-toast";
import { Content } from "../messages/types";
import { zIndex } from "render/styles/zIndex"; // 引入 zIndex

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const theme = useAppSelector(selectTheme);

  return (
    <div
      className="error-message"
      style={{ zIndex: zIndex.messageInputContainerZIndex }}
    >
      {message}
      <style jsx>{`
        .error-message {
          color: ${theme.error};
          font-size: 14px;
          padding: 0.5rem 1rem;
          background-color: ${theme.errorBg};
          border-radius: 4px;
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px ${theme.shadowColor};
          border: 1px solid ${theme.error}20;
        }
      `}</style>
    </div>
  );
};

const MessageInputContainer: React.FC = () => {
  const dispatch = useAppDispatch();

  const { balance, loading, error: balanceError } = useBalance();
  const { sendPermission, getErrorMessage } = useSendPermission(balance);

  const handleMessageSend = (content: Content) => {
    try {
      dispatch(handleSendMessage({ content }));
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return <ErrorMessage message="Loading..." />;
  }

  if (balanceError) {
    return <ErrorMessage message={balanceError} />;
  }

  if (!sendPermission.allowed) {
    return (
      <ErrorMessage
        message={getErrorMessage(sendPermission.reason, sendPermission.pricing)}
      />
    );
  }

  return <MessageInput onSendMessage={handleMessageSend} />;
};

export default MessageInputContainer;
