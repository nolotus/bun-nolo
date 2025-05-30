import { PaperAirplaneIcon } from "@primer/octicons-react";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import {
  abortAllMessages,
  selectActiveControllers,
} from "chat/dialog/dialogSlice";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useCallback, useState, useMemo } from "react";
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

  // 动态样式计算
  const buttonStyles = useMemo(() => {
    const baseStyles = {
      height: "40px",
      borderRadius: canAbort ? "20px" : "12px",
      background: canAbort ? theme.backgroundHover : theme.primary,
      cursor: disabled && !canAbort ? "not-allowed" : "pointer",
      transform: disabled
        ? "scale(0.95)"
        : isHovered
          ? "scale(1.03)"
          : "scale(1)",
      boxShadow: `0 4px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px ${theme.border}, inset 2px 2px 4px rgba(255, 255, 255, 0.2)`,
    };

    return {
      width: canAbort ? "40px" : "110px",
      ...baseStyles,
    };
  }, [canAbort, theme, disabled, isHovered]);

  const iconTransform = useMemo(() => {
    if (canAbort) return "scale(1)";
    return isHovered ? "translateX(3px) scale(1.1)" : "translateX(0) scale(1)";
  }, [canAbort, isHovered]);

  return (
    <>
      <style precedence="medium">
        {`
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
            transition: all 0.2s ease;
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
            transform: ${iconTransform};
            color: ${canAbort ? theme.textSecondary : "#FFFFFF"};
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
            width: 24px;
            height: 24px;
          }

          .pulse-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 1.5px solid ${theme.primary};
            opacity: 0.4;
            animation: ${canAbort ? "breathe 2s infinite" : "none"};
          }

          .stop-square {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            background: #000000;
            border-radius: 2px;
            transform: translate(-50%, -50%) scale(${isHovered && canAbort ? 1.1 : 1});
            transition: transform 0.2s ease;
          }

          .send-button:disabled {
            opacity: 0.6;
            filter: saturate(0.5);
            transform: scale(0.95);
          }

          .send-button:active:not(:disabled) {
            transform: scale(0.97);
            box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          @keyframes takeOff {
            0% { transform: translateX(0) scale(1); }
            50% { transform: translateX(10px) scale(1.1); }
            100% { transform: translateX(20px) scale(0.8); opacity: 0; }
          }

          @keyframes breathe {
            0% { transform: scale(0.85); opacity: 0.4; }
            50% { transform: scale(1.0); opacity: 0.7; }
            100% { transform: scale(0.85); opacity: 0.4; }
          }

          @media (max-width: 768px) {
            .send-button {
              width: 40px !important;
              border-radius: 12px !important;
            }
            .send-text { display: none; }
          }
        `}
      </style>

      <button
        className="send-button"
        style={buttonStyles}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled && !canAbort}
        aria-label={canAbort ? t("stopAllGeneration") : t("send")}
      >
        <div className="send-state">
          <span className="send-text">{t("send")}</span>
          <div className="send-icon-container">
            <PaperAirplaneIcon
              size={16}
              className="send-icon"
              style={
                isAnimating && !canAbort
                  ? {
                      animation: "takeOff 0.5s ease forwards",
                    }
                  : undefined
              }
            />
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
