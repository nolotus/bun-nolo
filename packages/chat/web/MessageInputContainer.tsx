import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/settings/settingSlice";
import React, { Suspense, lazy } from "react";
import { useSendPermission } from "../hooks/useSendPermission";
import { useBalance } from "auth/hooks/useBalance";
import { zIndex } from "render/styles/zIndex";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const theme = useAppSelector(selectTheme);
  const { t } = useTranslation("chat");

  return (
    <div
      className="error-message"
      style={{ zIndex: zIndex.messageInputContainerZIndex }}
    >
      <span>{message}</span>
      {isInsufficientBalance && (
        <span className="recharge-link" onClick={onRechargeClick}>
          {t("recharge")}
        </span>
      )}
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
          gap: 8px;
          box-shadow: 0 2px 4px ${theme.shadow1};
          animation: fadeIn 0.3s ease-out;
        }
        .recharge-link {
          color: ${theme.primary};
          cursor: pointer;
          text-decoration: underline;
        }
        .recharge-link:hover {
          color: ${theme.primaryHover};
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const LoadingAnimation: React.FC = () => {
  const theme = useAppSelector(selectTheme);

  return (
    <div
      className="loading-container"
      style={{ zIndex: zIndex.messageInputContainerZIndex }}
    >
      <div className="loading-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
      <style>{`
        .loading-container {
          padding: ${theme.space[4]};
          display: flex;
          justify-content: center;
          margin-top: 16px;
          background-color: ${theme.backgroundSecondary};
          border-radius: 8px;
          animation: slideIn 0.4s ease-out;
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
          animation: pulse 1.4s ease-in-out infinite;
        }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

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
          margin-top: 16px;
          animation: fadeIn 0.3s ease-out;
        }
        .placeholder-bar {
          flex: 1;
          height: 20px;
          background: linear-gradient(90deg, ${theme.backgroundTertiary}, ${theme.backgroundHover}, ${theme.backgroundTertiary});
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        .placeholder-button {
          width: 32px;
          height: 20px;
          background: linear-gradient(90deg, ${theme.backgroundTertiary}, ${theme.backgroundHover}, ${theme.backgroundTertiary});
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const MessageInputContainer: React.FC = () => {
  const { balance, loading, error: balanceError } = useBalance();
  const { sendPermission, getErrorMessage } = useSendPermission(balance);
  const navigate = useNavigate();

  const handleRechargeClick = () => {
    console.log("点击了充值链接，跳转至充值页面"); // 添加调试信息
    navigate("/recharge"); // 跳转到充值页面
  };

  if (loading) return <LoadingAnimation />;
  if (balanceError) return <ErrorMessage message={balanceError} />;
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
