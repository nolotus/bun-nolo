import { PaperAirplaneIcon } from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";
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
          font-weight: 500;
          outline: none;
          overflow: hidden;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* 发送模式样式 - macOS 风格 */
        .send-button.send-mode {
          width: 100px;
          height: 36px;
          border-radius: 8px;
          background: var(--primary);
          color: white;
          box-shadow: 
            0 1px 2px color-mix(in srgb, var(--primary) 25%, black),
            0 0 0 0.5px color-mix(in srgb, var(--primary) 20%, black),
            inset 0 0.5px 0 rgba(255, 255, 255, 0.25);
        }

        .send-button.send-mode:hover:not(:disabled) {
          background: color-mix(in srgb, var(--primary) 92%, white);
          transform: translateY(-0.5px);
          box-shadow: 
            0 2px 4px color-mix(in srgb, var(--primary) 20%, black),
            0 0 0 0.5px color-mix(in srgb, var(--primary) 20%, black),
            inset 0 0.5px 0 rgba(255, 255, 255, 0.3);
        }

        .send-button.send-mode:active:not(:disabled) {
          transform: translateY(0);
          background: color-mix(in srgb, var(--primary) 88%, black);
          box-shadow: 
            0 1px 1px color-mix(in srgb, var(--primary) 30%, black),
            0 0 0 0.5px color-mix(in srgb, var(--primary) 25%, black),
            inset 0 1px 2px rgba(0, 0, 0, 0.15);
          transition-duration: 0.05s;
        }

        /* 停止模式样式 - 更简洁的圆形 */
        .send-button.stop-mode {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--backgroundSecondary);
          border: 0.5px solid var(--border);
          color: var(--textSecondary);
          box-shadow: 
            0 1px 2px var(--shadowLight),
            inset 0 0.5px 0 rgba(255, 255, 255, 0.1);
        }

        .send-button.stop-mode:hover:not(:disabled) {
          background: color-mix(in srgb, var(--error) 6%, var(--backgroundSecondary));
          border-color: color-mix(in srgb, var(--error) 25%, var(--border));
          color: var(--error);
          transform: scale(1.03);
          box-shadow: 
            0 2px 4px color-mix(in srgb, var(--error) 10%, var(--shadowLight)),
            0 0 0 0.5px color-mix(in srgb, var(--error) 15%, transparent),
            inset 0 0.5px 0 rgba(255, 255, 255, 0.15);
        }

        .send-button.stop-mode:active:not(:disabled) {
          transform: scale(0.97);
          background: color-mix(in srgb, var(--error) 10%, var(--backgroundSecondary));
          transition-duration: 0.05s;
        }

        /* 焦点样式 - macOS 蓝色光晕 */
        .send-button:focus-visible {
          outline: none;
          box-shadow: 
            0 0 0 3px var(--background), 
            0 0 0 5px color-mix(in srgb, var(--primary) 40%, transparent);
        }

        /* 内容容器 */
        .send-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 1;
        }

        .send-text {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -0.015em;
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .send-button.send-mode:hover .send-text {
          transform: translateX(-1px);
        }

        .send-icon-container {
          position: relative;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-icon {
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .send-button.send-mode:hover .send-icon {
          transform: translateX(2px) scale(1.08);
        }

        /* 停止指示器 - 更精致的方形 */
        .stop-indicator {
          width: 12px;
          height: 12px;
          background: currentColor;
          border-radius: 2px;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .send-button.stop-mode:hover .stop-indicator {
          transform: scale(1.08);
          border-radius: 2.5px;
        }

        /* 禁用状态 */
        .send-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none !important;
          pointer-events: none;
        }

        /* 发射动画 - 更流畅 */
        @keyframes takeOff {
          0% { 
            transform: translateX(0) scale(1) rotate(0deg); 
            opacity: 1; 
          }
          40% { 
            transform: translateX(8px) scale(1.1) rotate(12deg); 
            opacity: 0.9; 
          }
          100% { 
            transform: translateX(24px) scale(0.7) rotate(35deg); 
            opacity: 0; 
          }
        }

        .send-icon.animating {
          animation: takeOff 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* 脉冲动画 - 更微妙 */
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1;
          }
          50% { 
            transform: scale(1.04); 
            opacity: 0.9;
          }
        }

        .send-button.stop-mode .stop-indicator {
          animation: pulse 2.4s ease-in-out infinite;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .send-button.send-mode {
            width: 36px !important;
            border-radius: 50% !important;
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
            transform: scale(0.96);
            transition-duration: 0.05s;
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
            opacity: 0.4;
          }
          
          .send-button.stop-mode .stop-indicator {
            animation: none !important;
          }
        }

        /* 高对比度支持 */
        @media (prefers-contrast: high) {
          .send-button.send-mode {
            border: 1.5px solid rgba(0, 0, 0, 0.3);
          }
          
          .send-button.stop-mode {
            border-width: 1.5px;
          }
        }

        /* 微妙的背景光效 - 更克制 */
        .send-button.send-mode::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.22s ease;
          pointer-events: none;
        }

        .send-button.send-mode:hover::before {
          opacity: 1;
        }

        .send-button:disabled::before {
          display: none;
        }

        /* 暗色模式优化 */
        @media (prefers-color-scheme: dark) {
          .send-button.send-mode {
            box-shadow: 
              0 1px 3px rgba(0, 0, 0, 0.4),
              0 0 0 0.5px color-mix(in srgb, var(--primary) 30%, black),
              inset 0 0.5px 0 rgba(255, 255, 255, 0.15);
          }

          .send-button.send-mode:hover:not(:disabled) {
            box-shadow: 
              0 2px 6px rgba(0, 0, 0, 0.35),
              0 0 0 0.5px color-mix(in srgb, var(--primary) 30%, black),
              inset 0 0.5px 0 rgba(255, 255, 255, 0.2);
          }

          .send-button.stop-mode {
            box-shadow: 
              0 1px 2px rgba(0, 0, 0, 0.3),
              inset 0 0.5px 0 rgba(255, 255, 255, 0.05);
          }
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
                  size={14}
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
