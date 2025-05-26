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
          background-color: ${theme.errorBg || theme.backgroundSecondary};
          border-radius: 8px;
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px ${theme.shadow1};
          border: 1px solid ${theme.error}20;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// 优雅的加载动画组件
const LoadingAnimation: React.FC = () => {
  const theme = useAppSelector(selectTheme);

  return (
    <div
      className="loading-container"
      style={{ zIndex: zIndex.messageInputContainerZIndex }}
    >
      <div className="loading-content">
        <div className="loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        <span className="loading-text">加载中</span>
      </div>

      <style>{`
        .loading-container {
          padding: ${theme.space[4]} ${theme.space[4]};
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 16px;
          background-color: ${theme.backgroundSecondary};
          border-radius: 8px;
          border: 1px solid ${theme.border};
          animation: slideIn 0.4s ease-out;
        }

        .loading-content {
          display: flex;
          align-items: center;
          gap: ${theme.space[3]};
        }

        .loading-dots {
          display: flex;
          gap: ${theme.space[1]};
        }

        .dot {
          width: 6px;
          height: 6px;
          background-color: ${theme.primary};
          border-radius: 50%;
          animation: pulse 1.4s ease-in-out infinite both;
        }

        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        .dot:nth-child(3) { animation-delay: 0s; }

        .loading-text {
          font-size: 14px;
          color: ${theme.textTertiary};
          font-weight: 400;
        }

        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// 输入框加载占位符
const InputLoadingPlaceholder: React.FC = () => {
  const theme = useAppSelector(selectTheme);

  return (
    <div className="input-loading-placeholder">
      <div className="placeholder-bar"></div>
      <div className="placeholder-button"></div>

      <style>{`
        .input-loading-placeholder {
          display: flex;
          align-items: center;
          gap: ${theme.space[3]};
          padding: ${theme.space[4]};
          background-color: ${theme.backgroundSecondary};
          border-radius: 8px;
          border: 1px solid ${theme.border};
          margin-top: 16px;
          animation: fadeIn 0.3s ease-out;
        }

        .placeholder-bar {
          flex: 1;
          height: 20px;
          background: linear-gradient(
            90deg,
            ${theme.backgroundTertiary} 0%,
            ${theme.backgroundHover} 50%,
            ${theme.backgroundTertiary} 100%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s ease-in-out infinite;
        }

        .placeholder-button {
          width: 32px;
          height: 20px;
          background: linear-gradient(
            90deg,
            ${theme.backgroundTertiary} 0%,
            ${theme.backgroundHover} 50%,
            ${theme.backgroundTertiary} 100%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s ease-in-out infinite;
          animation-delay: 0.2s;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

const MessageInputContainer: React.FC = () => {
  const { balance, loading, error: balanceError } = useBalance();
  const { sendPermission, getErrorMessage } = useSendPermission(balance);

  // 余额加载状态
  if (loading) {
    return <LoadingAnimation />;
  }

  // 余额错误状态
  if (balanceError) {
    return <ErrorMessage message={balanceError} />;
  }

  // 发送权限检查失败
  if (!sendPermission.allowed) {
    return (
      <ErrorMessage
        message={getErrorMessage(sendPermission.reason, sendPermission.pricing)}
      />
    );
  }

  // 正常状态 - 懒加载输入框
  return (
    <Suspense fallback={<InputLoadingPlaceholder />}>
      <MessageInput />
    </Suspense>
  );
};

export default MessageInputContainer;
