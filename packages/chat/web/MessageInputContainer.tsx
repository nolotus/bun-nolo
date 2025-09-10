// /chat/MessageInputContainer.tsx

import React, { Suspense, lazy, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { zIndex } from "render/styles/zIndex";
import { useBalance } from "auth/hooks/useBalance";
import { useSendPermission } from "../hooks/useSendPermission";

// 懒加载 MessageInput 组件
const MessageInput = lazy(() => import("./MessageInput"));

// --- [关键优化] 组件级别的预加载 ---
const PreloadMessageInput = () => {
  useEffect(() => {
    // 立即开始预加载
    import("./MessageInput");
  }, []);
  return null;
};

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
          
          box-shadow: 0 2px 4px var(--shadowLight);
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

interface LoadingInputPlaceholderProps {
  statusText?: string;
}

const LoadingInputPlaceholder: React.FC<LoadingInputPlaceholderProps> = ({
  statusText,
}) => {
  return (
    <div className="input-placeholder-container">
      <style href="input-placeholder-styles" precedence="component">{`
        .input-placeholder-container {
          padding: var(--space-4);
          padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
          animation: fadeInUp 0.3s ease-out;
        }
        
        .input-placeholder-wrapper {
          max-width: 100%;
          margin: 0 auto;
          position: relative;
        }
        
        .input-placeholder-bar {
          width: 100%;
          height: 48px;
          background: linear-gradient(
            90deg,
            var(--backgroundSecondary) 25%,
            var(--backgroundHover) 50%,
            var(--backgroundSecondary) 75%
          );
          background-size: 200% 100%;
          border-radius: var(--space-2);
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        
        /* 光泽效果 */
        .input-placeholder-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shine 2s ease-in-out infinite;
        }
        
        /* 状态文字覆盖在输入框上 */
        .status-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--textTertiary);
          font-size: 0.875rem;
          z-index: 1;
        }
        
        .loading-dots {
          display: flex;
          gap: var(--space-1);
        }
        
        .dot {
          width: 4px;
          height: 4px;
          background-color: var(--primary);
          border-radius: 50%;
          animation: pulse 1.4s ease-in-out infinite;
        }
        
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        .dot:nth-child(3) { animation-delay: 0s; }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes shine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
        
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(var(--space-2));
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .input-placeholder-container {
            padding: var(--space-3);
            padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
          }
          .input-placeholder-wrapper {
            padding-left: 0;
            padding-right: 0;
          }
          .input-placeholder-bar {
            height: 44px;
          }
        }
        @media (min-width: 768px) {
          .input-placeholder-wrapper {
            padding-left: var(--space-8);
            padding-right: var(--space-8);
          }
        }
        @media (min-width: 1024px) {
          .input-placeholder-wrapper {
            padding-left: var(--space-12);
            padding-right: var(--space-12);
          }
        }
        @media (min-width: 1440px) {
          .input-placeholder-wrapper {
            max-width: 960px;
          }
        }
        @media (min-width: 1600px) {
          .input-placeholder-wrapper {
            max-width: 1080px;
          }
        }
      `}</style>

      <div className="input-placeholder-wrapper">
        <div className="input-placeholder-bar">
          {statusText && (
            <div className="status-overlay">
              <span>{statusText}</span>
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageInputContainer: React.FC = () => {
  const { balance, loading, error: balanceError } = useBalance();
  const { sendPermission, getErrorMessage } = useSendPermission(balance);
  const navigate = useNavigate();
  const { t } = useTranslation("chat");

  const handleRechargeClick = () => {
    navigate("/recharge");
  };

  // --- [核心优化] 立即开始预加载，不影响UI ---
  useEffect(() => {
    // 组件挂载后立即开始预加载 MessageInput
    import("./MessageInput");
  }, []);

  // 1. 如果余额加载出错，显示错误
  if (balanceError) {
    return (
      <>
        <PreloadMessageInput />
        <ErrorMessage message={balanceError} />
      </>
    );
  }

  // 2. 如果权限还在检查中，显示权限检查状态
  if (loading) {
    return (
      <>
        <PreloadMessageInput />
        <LoadingInputPlaceholder
          statusText={t("checking_permission", "正在检查权限和余额...")}
        />
      </>
    );
  }

  // 3. 如果权限检查完成且不允许发送，显示权限错误
  if (!sendPermission.allowed) {
    const errorMessage = getErrorMessage(
      sendPermission.reason,
      sendPermission.pricing
    );
    const isInsufficientBalance =
      sendPermission.reason === "INSUFFICIENT_BALANCE";

    return (
      <>
        <PreloadMessageInput />
        <ErrorMessage
          message={errorMessage}
          isInsufficientBalance={isInsufficientBalance}
          onRechargeClick={handleRechargeClick}
        />
      </>
    );
  }

  // 4. 一切就绪，显示输入框（此时应该已经预加载完成）
  return (
    <Suspense
      fallback={
        <LoadingInputPlaceholder
          statusText={t("loading_input", "正在加载输入框...")}
        />
      }
    >
      <MessageInput />
    </Suspense>
  );
};

export default MessageInputContainer;
