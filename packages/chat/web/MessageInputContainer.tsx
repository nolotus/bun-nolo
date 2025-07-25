// /chat/MessageInputContainer.tsx

import React, { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { zIndex } from "render/styles/zIndex";
import { useBalance } from "auth/hooks/useBalance";
import { useSendPermission } from "../hooks/useSendPermission";

// 懒加载 MessageInput 组件
const MessageInput = lazy(() => import("./MessageInput"));

interface ErrorMessageProps {
  message: string;
  isInsufficientBalance?: boolean;
  onRechargeClick?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  isInsufficientBalance = false,
  onRechargeClick,
}) => {
  const { t } = useTranslation("chat");

  return (
    <div className="error-message">
      <style href="error-message-styles" precedence="component">{`
        .error-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          margin-top: var(--space-4);
          padding: var(--space-2) var(--space-4);
          
          font-size: 0.875rem; /* 14px */
          color: var(--error);
          background-color: var(--backgroundSecondary);
          border: 1px solid var(--error);
          border-radius: var(--space-2); /* 8px */
          
          box-shadow: 0 2px 4px var(--shadow1);
          animation: fadeIn 0.3s ease-out;
          z-index: ${zIndex.messageInputContainer};
        }
        .recharge-link {
          color: var(--primary);
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s ease;
        }
        .recharge-link:hover {
          color: var(--hover);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <span>{message}</span>
      {isInsufficientBalance && (
        <span className="recharge-link" onClick={onRechargeClick}>
          {t("recharge", "充值")}
        </span>
      )}
    </div>
  );
};

const LoadingAnimation: React.FC = () => {
  return (
    <div className="loading-container">
      <style href="loading-animation-styles" precedence="component">{`
        .loading-container {
          display: flex;
          justify-content: center;
          margin-top: var(--space-4);
          padding: var(--space-4);
          background-color: var(--backgroundSecondary);
          border-radius: var(--space-2);
          animation: slideIn 0.4s ease-out;
          z-index: ${zIndex.messageInputContainer};
        }
        .loading-dots {
          display: flex;
          gap: var(--space-2);
        }
        .dot {
          width: 8px;
          height: 8px;
          background-color: var(--primary);
          border-radius: 50%;
          animation: pulse 1.4s ease-in-out infinite;
        }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        .dot:nth-child(3) { animation-delay: 0s; }
        
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="loading-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );
};

// --- [核心修改] 重构 InputLoadingPlaceholder 以实现完美对齐 ---
const InputLoadingPlaceholder: React.FC = () => {
  return (
    // 使用与真实组件一致的容器结构和样式，确保无缝切换
    <div className="input-loading-container">
      <style href="input-placeholder-styles" precedence="component">{`
        .input-loading-container {
          padding: var(--space-4);
          padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
          background: var(--background);
          animation: placeholderFadeIn 0.5s ease-out;
        }
        .input-loading-wrapper {
          max-width: 100%;
          margin: 0 auto;
        }
        .placeholder-bar {
          height: 48px; /* 匹配桌面端输入框的最新高度 */
          background-color: var(--backgroundSecondary);
          border-radius: var(--space-2);
        }
        
        @keyframes placeholderFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* 复制 MessageInput.tsx 中的所有媒体查询，确保骨架屏布局完全一致 */
        @media (max-width: 768px) {
          .input-loading-container {
            padding: var(--space-3);
            padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
          }
          .input-loading-wrapper {
            padding-left: 0;
            padding-right: 0;
          }
          .placeholder-bar {
            height: 44px; /* 匹配移动端输入框的最新高度 */
          }
        }
        @media (min-width: 768px) {
          .input-loading-wrapper {
            padding-left: var(--space-8);
            padding-right: var(--space-8);
          }
        }
        @media (min-width: 1024px) {
          .input-loading-wrapper {
            padding-left: var(--space-12);
            padding-right: var(--space-12);
          }
        }
        @media (min-width: 1440px) {
          .input-loading-wrapper {
            max-width: 960px; /* 匹配 MessageInput 最新宽度 */
          }
        }
        @media (min-width: 1600px) {
          .input-loading-wrapper {
            max-width: 1080px; /* 匹配 MessageInput 最新宽度 */
          }
        }
      `}</style>
      <div className="input-loading-wrapper">
        <div className="placeholder-bar"></div>
      </div>
    </div>
  );
};

const MessageInputContainer: React.FC = () => {
  const { balance, loading, error: balanceError } = useBalance();
  const { sendPermission, getErrorMessage } = useSendPermission(balance);
  const navigate = useNavigate();

  const handleRechargeClick = () => {
    navigate("/recharge");
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  if (balanceError) {
    return <ErrorMessage message={balanceError} />;
  }

  if (!sendPermission.allowed) {
    const errorMessage = getErrorMessage(
      sendPermission.reason,
      sendPermission.pricing
    );
    const isInsufficientBalance =
      sendPermission.reason === "INSUFFICIENT_BALANCE";

    return (
      <ErrorMessage
        message={errorMessage}
        isInsufficientBalance={isInsufficientBalance}
        onRechargeClick={handleRechargeClick}
      />
    );
  }

  return (
    <Suspense fallback={<InputLoadingPlaceholder />}>
      <MessageInput />
    </Suspense>
  );
};

export default MessageInputContainer;
