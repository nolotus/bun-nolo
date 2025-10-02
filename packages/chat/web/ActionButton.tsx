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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Pro Display', sans-serif;
          transition: all 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
          backdrop-filter: blur(8px);
        }

        /* 发送模式样式 - 纤细精致风格 */
        .send-button.send-mode {
          width: 108px;
          height: 36px;
          border-radius: var(--space-4);
          background: linear-gradient(135deg, 
            var(--primary) 0%, 
            color-mix(in srgb, var(--primary) 85%, #000) 100%
          );
          color: white;
          border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
          box-shadow: 
            0 1px 3px color-mix(in srgb, var(--primary) 25%, transparent),
            0 0 0 1px color-mix(in srgb, var(--primary) 10%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .send-button.send-mode:hover:not(:disabled) {
          background: linear-gradient(135deg, 
            color-mix(in srgb, var(--primary) 90%, white) 0%, 
            color-mix(in srgb, var(--primary) 80%, #000) 100%
          );
          transform: translateY(-0.5px);
          box-shadow: 
            0 2px 8px color-mix(in srgb, var(--primary) 20%, transparent),
            0 1px 3px color-mix(in srgb, var(--primary) 30%, transparent),
            0 0 0 1px color-mix(in srgb, var(--primary) 15%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border-color: color-mix(in srgb, var(--primary) 30%, transparent);
        }

        .send-button.send-mode:active:not(:disabled) {
          transform: translateY(0);
          background: linear-gradient(135deg, 
            color-mix(in srgb, var(--primary) 95%, #000) 0%, 
            color-mix(in srgb, var(--primary) 90%, #000) 100%
          );
          box-shadow: 
            0 1px 2px color-mix(in srgb, var(--primary) 35%, transparent),
            inset 0 1px 3px rgba(0, 0, 0, 0.1);
          transition-duration: 0.1s;
        }

        /* 停止模式样式 - 更加纤细克制 */
        .send-button.stop-mode {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--backgroundSecondary);
          border: 1px solid var(--borderLight);
          color: var(--textTertiary);
          box-shadow: 
            0 1px 2px var(--shadowLight),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .send-button.stop-mode:hover:not(:disabled) {
          background: color-mix(in srgb, var(--error) 6%, var(--backgroundSecondary));
          border-color: color-mix(in srgb, var(--error) 15%, var(--border));
          color: color-mix(in srgb, var(--error) 85%, var(--textSecondary));
          transform: scale(1.02);
          box-shadow: 
            0 2px 6px color-mix(in srgb, var(--error) 8%, transparent),
            0 1px 2px var(--shadowLight),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .send-button.stop-mode:active:not(:disabled) {
          transform: scale(0.98);
          background: color-mix(in srgb, var(--error) 10%, var(--backgroundSecondary));
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
          transition-duration: 0.1s;
        }

        /* 焦点样式 - 更精致的轮廓 */
        .send-button:focus-visible {
          outline: none;
          box-shadow: 
            0 0 0 2px var(--background), 
            0 0 0 4px color-mix(in srgb, var(--primary) 50%, transparent),
            0 2px 8px color-mix(in srgb, var(--primary) 15%, transparent);
        }

        /* 内容容器 - 增加呼吸感 */
        .send-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 1;
          padding: 0 var(--space-1);
        }

        .send-text {
          font-size: 0.8125rem;
          font-weight: 500;
          letter-spacing: -0.005em;
          transition: all 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          white-space: nowrap;
        }

        .send-button.send-mode:hover .send-text {
          transform: translateX(-1px);
          letter-spacing: 0.002em;
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
          transition: all 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          filter: drop-shadow(0 0.5px 1px rgba(0, 0, 0, 0.1));
        }

        .send-button.send-mode:hover .send-icon {
          transform: translateX(2px) scale(1.05);
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
        }

        /* 停止指示器 - 更精致的形状 */
        .stop-indicator {
          width: 12px;
          height: 12px;
          background: currentColor;
          border-radius: var(--space-1);
          transition: all 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          opacity: 0.8;
        }

        .send-button.stop-mode:hover .stop-indicator {
          transform: scale(1.08);
          border-radius: 3px;
          opacity: 1;
        }

        /* 禁用状态 - 更克制的视觉反馈 */
        .send-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none !important;
          filter: grayscale(0.2) saturate(0.8);
          pointer-events: none;
        }

        /* 发射动画 - 更流畅自然 */
        @keyframes takeOff {
          0% { 
            transform: translateX(0) scale(1) rotate(0deg); 
            opacity: 1; 
          }
          40% { 
            transform: translateX(8px) scale(1.08) rotate(12deg); 
            opacity: 0.9; 
          }
          100% { 
            transform: translateX(24px) scale(0.7) rotate(35deg); 
            opacity: 0; 
          }
        }

        .send-icon.animating {
          animation: takeOff 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        /* 脉冲动画 - 更加微妙 */
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.03); 
            opacity: 1;
          }
        }

        .send-button.stop-mode .stop-indicator {
          animation: pulse 2.5s ease-in-out infinite;
        }

        /* 背景光效果 - 更精致的渐变 */
        .send-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.12) 0%, 
            rgba(255, 255, 255, 0.05) 40%,
            transparent 70%
          );
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }

        .send-button:hover::before {
          opacity: 1;
        }

        /* 响应式设计 - 保持纤细感 */
        @media (max-width: 768px) {
          .send-button.send-mode {
            width: 36px !important;
            height: 36px !important;
            border-radius: 50% !important;
            padding: 0 !important;
          }
          
          .send-text {
            display: none;
          }
          
          .send-content {
            gap: 0;
            padding: 0;
          }
        }

        /* 触摸设备优化 */
        @media (hover: none) and (pointer: coarse) {
          .send-button:hover {
            transform: none;
          }
          
          .send-button:active:not(:disabled) {
            transform: scale(0.96);
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
            opacity: 0.6;
          }
          
          .send-button.stop-mode .stop-indicator {
            animation: none !important;
          }
        }

        /* 高对比度支持 */
        @media (prefers-contrast: high) {
          .send-button {
            border-width: 1.5px !important;
          }
          
          .send-button.stop-mode {
            border-width: 1.5px !important;
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
