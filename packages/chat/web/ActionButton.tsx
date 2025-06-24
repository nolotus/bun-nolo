import { PaperAirplaneIcon } from "@primer/octicons-react";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import {
  abortAllMessages,
  selectActiveControllers,
} from "chat/dialog/dialogSlice";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useCallback, useState } from "react";
import type React from "react";

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const SendButton: React.FC<SendButtonProps> = ({ onClick, disabled }) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const { t } = useTranslation("chat");
  const activeControllers = useAppSelector(selectActiveControllers);
  const canAbort = Object.keys(activeControllers).length > 0;

  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAbortAllMessages = useCallback(() => {
    dispatch(abortAllMessages());
    toast.success(t("allMessagesAborted"), { duration: 3000 });
  }, [dispatch, t]);

  const handleClick = useCallback(() => {
    if (canAbort) {
      handleAbortAllMessages();
    } else {
      onClick();
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [canAbort, handleAbortAllMessages, onClick]);

  return (
    <>
      <style href="send-button" precedence="medium">{`
        .send-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          font-weight: 600;
          outline: none;
          overflow: hidden;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px ${theme.shadow1}, inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* 发送模式样式 */
        .send-button.send-mode {
          width: 110px;
          height: 40px;
          border-radius: ${theme.space[3]};
          background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}90 100%);
          color: white;
        }

        .send-button.send-mode:hover:not(:disabled) {
          background: linear-gradient(135deg, ${theme.primary}e6 0%, ${theme.primary}d6 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${theme.primary}30, 0 2px 6px ${theme.shadow1}, inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .send-button.send-mode:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 1px 4px ${theme.primary}40, inset 0 2px 4px rgba(0, 0, 0, 0.1);
          transition-duration: 0.1s;
        }

        /* 停止模式样式 */
        .send-button.stop-mode {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          color: ${theme.textSecondary};
        }

        .send-button.stop-mode:hover:not(:disabled) {
          background: ${theme.error}15;
          border-color: ${theme.error}30;
          color: ${theme.error};
          transform: scale(1.05);
          box-shadow: 0 4px 12px ${theme.error}20, 0 2px 6px ${theme.shadow1};
        }

        .send-button.stop-mode:active:not(:disabled) {
          transform: scale(0.95);
          background: ${theme.error}25;
          transition-duration: 0.1s;
        }

        /* 焦点样式 */
        .send-button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px ${theme.background}, 0 0 0 4px ${theme.primary};
        }

        /* 内容容器 */
        .send-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${theme.space[2]};
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 1;
        }

        .send-text {
          font-size: 0.875rem;
          font-weight: 550;
          letter-spacing: -0.01em;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .send-button.send-mode:hover .send-text {
          transform: translateX(-2px);
        }

        .send-icon-container {
          position: relative;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-icon {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .send-button.send-mode:hover .send-icon {
          transform: translateX(3px) scale(1.1);
        }

        /* 停止指示器 */
        .stop-indicator {
          width: 14px;
          height: 14px;
          background: currentColor;
          border-radius: ${theme.space[1]};
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .send-button.stop-mode:hover .stop-indicator {
          transform: scale(1.1);
          border-radius: 4px;
        }

        /* 禁用状态 */
        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          filter: grayscale(0.3);
          pointer-events: none;
        }

        /* 发射动画 */
        @keyframes takeOff {
          0% { 
            transform: translateX(0) scale(1) rotate(0deg); 
            opacity: 1; 
          }
          50% { 
            transform: translateX(12px) scale(1.15) rotate(15deg); 
            opacity: 0.8; 
          }
          100% { 
            transform: translateX(30px) scale(0.6) rotate(45deg); 
            opacity: 0; 
          }
        }

        .send-icon.animating {
          animation: takeOff 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* 脉冲动画用于停止按钮 */
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
          }
          50% { 
            transform: scale(1.05); 
          }
        }

        .send-button.stop-mode .stop-indicator {
          animation: pulse 2s ease-in-out infinite;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .send-button.send-mode {
            width: 40px !important;
            border-radius: 50% !important;
            padding: 0 !important;
          }
          
          .send-text {
            display: none;
          }
          
          .send-content {
            gap: 0;
          }
        }

        /* 触摸设备优化 */
        @media (hover: none) and (pointer: coarse) {
          .send-button:hover {
            transform: none;
          }
          
          .send-button:active:not(:disabled) {
            transform: scale(0.95);
            transition-duration: 0.1s;
          }
        }

        /* 减少动画偏好 */
        @media (prefers-reduced-motion: reduce) {
          .send-button,
          .send-text,
          .send-icon,
          .stop-indicator {
            transition: none !important;
          }
          
          .send-button:hover {
            transform: none !important;
          }
          
          .send-icon.animating {
            animation: none !important;
            opacity: 0.5;
          }
          
          .send-button.stop-mode .stop-indicator {
            animation: none !important;
          }
        }

        /* 高对比度支持 */
        @media (prefers-contrast: high) {
          .send-button {
            border-width: 2px;
          }
          
          .send-button.stop-mode {
            border-width: 2px;
          }
        }

        /* 背景光效果 */
        .send-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .send-button:hover::before {
          opacity: 1;
        }

        .send-button:disabled::before {
          display: none;
        }
      `}</style>

      <button
        className={`send-button ${canAbort ? "stop-mode" : "send-mode"}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled && !canAbort}
        aria-label={canAbort ? t("stopAllGeneration") : t("send")}
        title={canAbort ? t("stopAllGeneration") : t("send")}
      >
        <div className="send-content">
          {canAbort ? (
            <div className="stop-indicator" />
          ) : (
            <>
              <span className="send-text">{t("send")}</span>
              <div className="send-icon-container">
                <PaperAirplaneIcon
                  size={16}
                  className={`send-icon ${isAnimating ? "animating" : ""}`}
                />
              </div>
            </>
          )}
        </div>
      </button>
    </>
  );
};

export default SendButton;
