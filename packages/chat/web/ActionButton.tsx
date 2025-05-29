import { PaperAirplaneIcon } from "@primer/octicons-react";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import {
  abortAllMessages,
  selectActiveControllers,
} from "chat/dialog/dialogSlice";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import type React from "react";
import { useCallback, useState } from "react";

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

  const handleClick = () => {
    if (canAbort) {
      handleAbortAllMessages();
    } else {
      onClick();
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <>
      <style>
        {`
          .neumorphic-button {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 40px;
            width: ${canAbort ? "40px" : "110px"};
            border-radius: ${canAbort ? "20px" : "12px"};
            border: none;
            cursor: ${disabled ? "not-allowed" : "pointer"};
            font-weight: 600;
            outline: none;
            overflow: hidden;
            padding: 0;
            transition: all 0.2s ease;
            background: ${canAbort ? theme.backgroundHover : theme.primary};
            box-shadow: 
              0 4px 8px rgba(0, 0, 0, 0.15),
              0 0 0 1px ${theme.border},
              inset 2px 2px 4px rgba(255, 255, 255, 0.2);
            transform: ${
              disabled ? "scale(0.95)" : isHovered ? "scale(1.03)" : "scale(1)"
            };
          }

          .send-state {
            display: flex;
            align-items: center;
            gap: 6px;
            color: ${canAbort ? theme.textSecondary : "#FFFFFF"};
            transition: opacity 0.3s ease;
            opacity: ${canAbort ? 0 : 1};
          }

          .send-text {
            font-size: 13px;
            transition: transform 0.2s ease;
            transform: ${isHovered && !canAbort ? "translateX(-2px)" : "translateX(0)"};
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
            position: absolute;
            transition: transform 0.2s ease;
            transform: ${
              isHovered && !canAbort
                ? "translateX(3px) scale(1.1)"
                : "translateX(0) scale(1)"
            };
            color: ${canAbort ? theme.textSecondary : "#FFFFFF"};
          }

          /* 简单的飞机起飞动画 */
          ${
            isAnimating && !canAbort
              ? `
            .send-icon {
              animation: takeOff 0.5s ease forwards;
            }
          `
              : ""
          }

          .stop-state {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            transition: opacity 0.3s ease;
            opacity: ${canAbort ? 1 : 0};
          }

          .stop-indicator {
            position: relative;
            width: 22px;
            height: 22px;
          }

          .pulse-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 1.5px solid ${theme.primary};
            opacity: 0.5;
            animation: ${canAbort ? "pulse 1.5s infinite" : "none"};
          }

          .stop-square {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 8px;
            height: 8px;
            background: ${theme.error};
            border-radius: 2px;
            transform: translate(-50%, -50%) scale(${isHovered && canAbort ? 1.1 : 1});
            transition: transform 0.2s ease;
          }

          .neumorphic-button:disabled {
            opacity: 0.6;
            filter: saturate(0.5);
            transform: scale(0.95);
          }

          .neumorphic-button:active:not(:disabled) {
            transform: scale(0.97);
            box-shadow: 
              inset 2px 2px 4px rgba(0, 0, 0, 0.1),
              0 2px 4px rgba(0, 0, 0, 0.1);
          }

          /* 动画定义 */
          @keyframes takeOff {
            0% {
              transform: translateX(0) scale(1);
            }
            50% {
              transform: translateX(10px) scale(1.1);
            }
            100% {
              transform: translateX(20px) scale(0.8);
              opacity: 0;
            }
          }

          @keyframes pulse {
            0% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.3;
            }
            100% {
              transform: scale(0.8);
              opacity: 0.5;
            }
          }

          @media (max-width: 768px) {
            .neumorphic-button {
              height: 40px;
              width: 40px;
              border-radius: 12px;
            }
            .send-text {
              display: none;
            }
          }
        `}
      </style>

      <button
        className="neumorphic-button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled && !canAbort}
        aria-label={canAbort ? t("stopAllGeneration") : t("send")}
      >
        <div className="send-state">
          <span className="send-text">{t("send")}</span>
          <div className="send-icon-container">
            <PaperAirplaneIcon size={16} className="send-icon" />
          </div>
        </div>
        <div className="stop-state">
          <div className="stop-indicator">
            <div className="pulse-ring"></div>
            <div className="stop-square"></div>
          </div>
        </div>
      </button>
    </>
  );
};

export default SendButton;
