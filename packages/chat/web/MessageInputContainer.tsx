import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import React, { Suspense, lazy } from "react";
import { useSendPermission } from "../hooks/useSendPermission";
import { useBalance } from "auth/hooks/useBalance";
import { zIndex } from "render/styles/zIndex";

// 懒加载 MessageInput 组件
const MessageInput = lazy(() => import("./MessageInput"));

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
      <style>{`
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

// 加载提示组件
const LoadingFallback = () => (
  <div style={{ padding: "0.5rem 1rem", textAlign: "center" }}>
    加载输入框...
  </div>
);

const MessageInputContainer: React.FC = () => {
  const { balance, loading, error: balanceError } = useBalance();
  const { sendPermission, getErrorMessage } = useSendPermission(balance);

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

  return (
    <Suspense fallback={<LoadingFallback />}>
      <MessageInput />
    </Suspense>
  );
};

export default MessageInputContainer;
