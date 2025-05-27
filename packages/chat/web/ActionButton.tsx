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
  const [isPressed, setIsPressed] = useState(false);

  const handleAbortAllMessages = useCallback(() => {
    dispatch(abortAllMessages());
    toast.success(t("allMessagesAborted"), { duration: 3000 });
  }, [dispatch, t]);

  const handleClick = () => {
    if (canAbort) {
      handleAbortAllMessages();
    } else {
      onClick();
    }
  };

  return (
    <>
      <style>
        {`
          .silk-button-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .silk-button {
            position: relative;
            height: 40px;
            border: none;
            cursor: ${disabled ? "not-allowed" : "pointer"};
            font-size: 14px;
            font-weight: 600;
            outline: none;
            overflow: hidden;
            
            /* 丝滑形变 - 纯色背景 */
            width: ${canAbort ? "40px" : "100px"};
            border-radius: ${canAbort ? "20px" : "10px"};
            padding: 0;
            
            /* 纯色背景 */
            background-color: ${
              disabled
                ? theme.textLight
                : canAbort
                  ? theme.backgroundHover
                  : theme.primary
            };
            
            /* 纯色边框效果 */
            box-shadow: ${
              disabled
                ? "none"
                : isPressed
                  ? `inset 0 0 0 2px ${canAbort ? theme.border : theme.primaryDark}`
                  : isHovered
                    ? `0 0 0 2px ${canAbort ? theme.border : theme.primary}40`
                    : "none"
            };
            
            /* 绝对顺滑的过渡 */
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            
            /* 流畅变换 */
            transform: ${
              disabled
                ? "scale(0.95)"
                : isPressed
                  ? "scale(0.96)"
                  : isHovered
                    ? "scale(1.02) translateY(-1px)"
                    : "scale(1)"
            };
            
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* 发送状态 - 流水般顺滑 */
          .send-flow {
            position: absolute;
            display: flex;
            align-items: center;
            gap: 8px;
            color: ${disabled ? theme.textTertiary : "#FFFFFF"};
            
            /* 丝滑显隐 */
            opacity: ${canAbort ? "0" : "1"};
            transform: ${
              canAbort
                ? "translateX(20px) scale(0.8)"
                : "translateX(0) scale(1)"
            };
            
            /* 顺滑过渡 - 无停顿 */
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            pointer-events: ${canAbort ? "none" : "auto"};
          }

          .send-text {
            letter-spacing: 0.02em;
            transform: ${isHovered && !canAbort ? "translateX(-2px)" : "translateX(0)"};
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .send-icon {
            transform: ${
              isHovered && !canAbort
                ? "translateX(4px) scale(1.1)"
                : "translateX(0) scale(1)"
            };
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          /* 停止状态 - 如水流般 */
          .stop-flow {
            position: absolute;
            color: ${theme.textSecondary};
            
            /* 丝滑显隐 */
            opacity: ${canAbort ? "1" : "0"};
            transform: ${
              canAbort ? "scale(1) rotate(0deg)" : "scale(0.6) rotate(-90deg)"
            };
            
            /* 顺滑过渡 - 无停顿 */
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            pointer-events: ${canAbort ? "auto" : "none"};
          }

          .stop-wrapper {
            position: relative;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* 流动的加载环 - 纯色 */
          .flow-ring {
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top-color: ${theme.primary};
            border-left-color: ${theme.primary};
            
            /* 连续流畅旋转 */
            animation: ${canAbort ? "smoothFlow 1.5s linear infinite" : "none"};
            
            /* 悬停时流速变化 */
            animation-duration: ${isHovered && canAbort ? "1s" : "1.5s"};
            
            transition: 
              border-color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              animation-duration 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          /* 悬停时变红 - 纯色变化 */
          .silk-button:hover .flow-ring {
            border-top-color: ${theme.error};
            border-left-color: ${theme.error};
          }

          .flow-square {
            width: 6px;
            height: 6px;
            background-color: ${theme.textSecondary};
            border-radius: 1px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) ${
              isHovered && canAbort ? "scale(1.2)" : "scale(1)"
            };
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            z-index: 1;
          }

          /* 悬停时方块变红 */
          .silk-button:hover .flow-square {
            background-color: ${theme.error};
          }

          /* 聚焦效果 - 纯色光环 */
          .silk-button:focus {
            box-shadow: 
              0 0 0 3px ${theme.focus || theme.primary}50;
          }

          /* 连续流畅旋转 - 无卡顿 */
          @keyframes smoothFlow {
            from { 
              transform: rotate(0deg); 
            }
            to { 
              transform: rotate(360deg); 
            }
          }

          /* 触摸设备优化 */
          @media (hover: none) {
            .silk-button {
              transform: scale(1);
            }
            
            .silk-button:active {
              transform: scale(0.96);
            }
          }

          /* 减少动画用户优化 */
          @media (prefers-reduced-motion: reduce) {
            .silk-button,
            .send-flow,
            .stop-flow,
            .flow-ring,
            .flow-square,
            .send-text,
            .send-icon {
              transition-duration: 0.15s;
            }
            
            .flow-ring {
              animation-duration: 3s;
            }
          }

          /* 高刷新率屏幕优化 */
          @media (min-resolution: 120dpi) {
            .silk-button {
              transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
          }
        `}
      </style>

      <div className="silk-button-container">
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsPressed(false);
          }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          className="silk-button"
          disabled={disabled && !canAbort}
          aria-label={canAbort ? t("stopAllGeneration") : t("send")}
        >
          {/* 发送状态 - 如丝般顺滑 */}
          <div className="send-flow">
            <span className="send-text">{t("send")}</span>
            <PaperAirplaneIcon size={14} className="send-icon" />
          </div>

          {/* 停止状态 - 水流般自然 */}
          <div className="stop-flow">
            <div className="stop-wrapper">
              <div className="flow-ring"></div>
              <div className="flow-square"></div>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default SendButton;
