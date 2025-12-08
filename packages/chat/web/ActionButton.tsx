import { LuSend } from "react-icons/lu";
import { useAppDispatch, useAppSelector } from "app/store";
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
  const { t } = useTranslation("chat");
  const activeControllers = useAppSelector(selectActiveControllers);
  const canAbort = Object.keys(activeControllers).length > 0;

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
          --button-size: 44px;
          width: var(--button-size);
          height: var(--button-size);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: none;
          outline: none;
          padding: 0;
          transition: all 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
          backdrop-filter: blur(8px);
          flex-shrink: 0;
        }

        /* 发送模式 */
        .send-button.send-mode {
          background: linear-gradient(135deg, 
            var(--primary) 0%, 
            color-mix(in srgb, var(--primary) 85%, #000) 100%
          );
          color: white;
          border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
          box-shadow: 
            0 1px 3px color-mix(in srgb, var(--primary) 25%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .send-button.send-mode:hover:not(:disabled) {
          background: linear-gradient(135deg, 
            color-mix(in srgb, var(--primary) 90%, white) 0%, 
            color-mix(in srgb, var(--primary) 80%, #000) 100%
          );
          transform: translateY(-2px);
          box-shadow: 
            0 4px 12px color-mix(in srgb, var(--primary) 20%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .send-button.send-mode:active:not(:disabled) {
          transform: translateY(0);
          background: linear-gradient(135deg, 
            color-mix(in srgb, var(--primary) 95%, #000) 0%, 
            color-mix(in srgb, var(--primary) 90%, #000) 100%
          );
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
          transition-duration: 0.1s;
        }

        /* 停止模式 */
        .send-button.stop-mode {
          background: var(--backgroundSecondary);
          border: 1px solid var(--borderLight);
          color: var(--textTertiary);
          box-shadow: 0 1px 2px var(--shadowLight);
        }

        .send-button.stop-mode:hover:not(:disabled) {
          background: color-mix(in srgb, var(--error) 6%, var(--backgroundSecondary));
          border-color: color-mix(in srgb, var(--error) 15%, var(--border));
          color: color-mix(in srgb, var(--error) 85%, var(--textSecondary));
          transform: translateY(-2px);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--error) 8%, transparent);
        }

        .send-button.stop-mode:active:not(:disabled) {
          transform: translateY(0);
          background: color-mix(in srgb, var(--error) 10%, var(--backgroundSecondary));
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
          transition-duration: 0.1s;
        }

        /* 焦点样式 */
        .send-button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--background), 
                      0 0 0 4px color-mix(in srgb, var(--primary) 50%, transparent);
        }

        /* 图标 */
        .send-icon {
          transition: all 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: rotate(-45deg);
        }

        .send-button.send-mode:hover .send-icon {
          transform: translateY(-2px) scale(1.05) rotate(-45deg);
        }

        /* 停止指示器 */
        .stop-indicator {
          width: 14px;
          height: 14px;
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

        /* 禁用状态 */
        .send-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          filter: grayscale(0.2) saturate(0.8);
          pointer-events: none;
        }

        /* 发送动画 */
        @keyframes takeOff {
          0% { transform: translateY(0) scale(1) rotate(-45deg); opacity: 1; }
          40% { transform: translateY(-15px) scale(1.1) rotate(-45deg); opacity: 1; }
          100% { transform: translateY(-50px) scale(0.5) rotate(-45deg); opacity: 0; }
        }

        .send-icon.animating {
          animation: takeOff 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        /* 光效 */
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

        /* 响应式 */
        @media (max-width: 768px) { .send-button { --button-size: 40px; } }
        @media (max-width: 480px) { .send-button { --button-size: 36px; } }
        @media (min-width: 769px) { .send-button { --button-size: 48px; } }

        /* 触摸设备 */
        @media (hover: none) and (pointer: coarse) {
          .send-button:hover { transform: none; }
          .send-button:active:not(:disabled) {
            transform: scale(0.96);
            transition-duration: 0.1s;
          }
        }

        /* 减少动画 */
        @media (prefers-reduced-motion: reduce) {
          .send-button, .send-icon, .stop-indicator { transition: none !important; }
          .send-button:hover { transform: none !important; }
          .send-icon.animating { animation: none !important; opacity: 0.6; }
        }

        /* 高对比度 */
        @media (prefers-contrast: high) {
          .send-button, .send-button.stop-mode { border-width: 1.5px !important; }
        }
      `}</style>

      <button
        className={`send-button ${canAbort ? "stop-mode" : "send-mode"}`}
        onClick={handleClick}
        disabled={disabled && !canAbort}
        aria-label={canAbort ? t("stopAllGeneration") : t("send")}
        title={canAbort ? t("stopAllGeneration") : t("send")}
      >
        {canAbort ? (
          <div className="stop-indicator" />
        ) : (
          <LuSend
            size={20}
            strokeWidth={1.8}
            className={`send-icon ${isAnimating ? "animating" : ""}`}
          />
        )}
      </button>
    </>
  );
};

export default SendButton;
