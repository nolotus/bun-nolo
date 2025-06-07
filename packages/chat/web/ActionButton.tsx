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
  const buttonStyles = useMemo(
    () => ({
      width: canAbort ? "40px" : "110px",
      height: "40px",
      borderRadius: canAbort ? "50%" : "12px",
      background: canAbort
        ? isHovered
          ? "rgba(231, 76, 60, 0.2)"
          : theme.backgroundHover || "#f0f0f0" // 使用一个更柔和的默认背景
        : isHovered
          ? theme.primary + "e6" // 调整悬停透明度
          : theme.primary,
      cursor: disabled && !canAbort ? "not-allowed" : "pointer",
      transform: isHovered && !disabled ? "scale(1.02)" : "scale(1)",
      boxShadow:
        isHovered && !disabled
          ? "0 7px 14px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)"
          : "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
    }),
    [canAbort, theme, disabled, isHovered]
  );

  const iconTransform = useMemo(
    () =>
      canAbort
        ? "scale(1)"
        : isHovered
          ? "translateX(3px) scale(1.1)"
          : "translateX(0) scale(1)",
    [canAbort, isHovered]
  );

  // 停止图标的动态样式
  const stopIndicatorStyle = useMemo(
    () => ({
      transform:
        canAbort && isHovered
          ? "scale(1.1) rotate(45deg)"
          : "scale(1) rotate(0deg)",
      borderRadius: canAbort && isHovered ? "4px" : "2px",
    }),
    [canAbort, isHovered]
  );

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
            /* 优化过渡效果，使其更平滑 */
            transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out, box-shadow 0.25s ease-in-out, width 0.3s ease-in-out, border-radius 0.3s ease-in-out;
          }

          /* 为键盘用户提供清晰的焦点指示 */
          .send-button:focus-visible {
            outline: 2px solid ${theme.primary};
            outline-offset: 3px;
          }

          .send-state {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            transition: opacity 0.3s ease;
            opacity: ${canAbort ? 0 : 1};
            width: 100%;
            height: 100%;
            gap: 8px;
          }

          .send-text {
            font-size: 14px;
            transition: transform 0.2s ease-in-out;
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
            transition: transform 0.2s ease-in-out;
            transform: ${iconTransform};
            color: #FFFFFF;
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
            width: 14px;
            height: 14px;
            background: ${theme.textSecondary || "#333"};
            transition: transform 0.25s ease-in-out, border-radius 0.25s ease-in-out;
          }

          .send-button:disabled:not(.can-abort) {
            opacity: 0.6;
            filter: saturate(0.5);
            transform: scale(0.95);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }

          .send-button:active:not(:disabled) {
            /* 点击时提供更细腻的反馈 */
            transform: scale(0.98);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
            transition: transform 0.1s ease, box-shadow 0.1s ease;
          }

          @keyframes takeOff {
            0% { transform: translateX(0) scale(1); opacity: 1; }
            50% { transform: translateX(10px) scale(1.1); opacity: 0.8; }
            100% { transform: translateX(25px) scale(0.5); opacity: 0; }
          }

          @media (max-width: 768px) {
            .send-button {
              width: 40px !important;
              border-radius: ${canAbort ? "50%" : "12px"} !important;
            }
            .send-text { display: none; }
          }
        `}
      </style>

      <button
        className={`send-button ${canAbort ? "can-abort" : ""}`}
        style={buttonStyles}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled && !canAbort}
        aria-label={canAbort ? t("stopAllGeneration") : t("send")}
        title={canAbort ? t("stopAllGeneration") : t("send")}
      >
        <div className="stop-state">
          <div className="stop-indicator" style={stopIndicatorStyle}></div>
        </div>

        {!canAbort && (
          <div className="send-state">
            <span className="send-text">{t("send")}</span>
            <div className="send-icon-container">
              <PaperAirplaneIcon
                size={16}
                className="send-icon"
                style={
                  isAnimating
                    ? { animation: "takeOff 0.5s ease-in forwards" }
                    : undefined
                }
              />
            </div>
          </div>
        )}
      </button>
    </>
  );
};

export default SendButton;
