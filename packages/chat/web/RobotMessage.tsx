// RobotMessage.jsx
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useRef } from "react";
import { Avatar } from "render/ui";
import { useTranslation } from "react-i18next";
import { Tooltip } from "render/web/ui/Tooltip";

import { useAppSelector } from "app/hooks";
import { MessageContent } from "./MessageContent";
import type { Message } from "../messages/types";
import { MessageActions } from "./MessageActions";

const RobotMessage: React.FC<Message> = ({
  dbKey,
  content,
  cybotId,
  controller,
}) => {
  const theme = useAppSelector(selectTheme);
  const { t } = useTranslation("chat");
  const messageRef = useRef(null);

  return (
    <>
      <div className="chat-message-container chat-message-other">
        <div className="chat-message-content-wrapper">
          <div className="chat-message-avatar-wrapper">
            <Avatar name="robot" />
          </div>

          <div className="chat-robot-message-content" ref={messageRef}>
            <MessageContent content={content} role="other" />

            <div className="message-footer">
              <div className="footer-left">
                {controller && (
                  <Tooltip content={t("stopGeneration")} placement="top">
                    <button
                      className="gen-stop-btn"
                      onClick={() => controller.abort()}
                      aria-label={t("stopGeneration")}
                    >
                      <div className="gen-stop-icon-wrapper">
                        <div className="gen-loading-ring"></div>
                        <div className="gen-stop-square"></div>
                      </div>
                    </button>
                  </Tooltip>
                )}
              </div>
              <div className="footer-right">
                <MessageActions content={content} dbKey={dbKey} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style href="robot-msg">{`
        .chat-message-container {
          display: flex;
          margin-bottom: 18px;
          padding: 0 16px;
        }

        .chat-message-container.chat-message-other {
          justify-content: flex-start;
        }

        .chat-message-content-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
          max-width: 88%;
        }

        .chat-message-avatar-wrapper {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .chat-robot-message-content {
          color: ${theme.text};
          position: relative;
          padding: 4px 0;
          width: 100%;
        }

        .message-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 6px;
          width: 100%;
        }

        .footer-left {
          display: flex;
          align-items: center;
        }

        .footer-right {
          display: flex;
          align-items: center;
          margin-left: auto;
        }

        .gen-stop-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 5px;
          padding: 0;
          cursor: pointer;
          background-color: transparent;
          transition: transform 0.15s ease;
          position: relative;
        }

        .gen-stop-btn:hover {
          transform: translateY(-1px);
        }

        .gen-stop-btn:hover .gen-loading-ring:before {
          border-top-color: ${theme.textTertiary || "#9CA3AF"};
          border-left-color: ${theme.textTertiary || "#9CA3AF"};
          animation-duration: 1.5s;
        }

        .gen-stop-btn:hover .gen-stop-square {
          background-color: ${theme.textDanger || "#e53935"};
          transform: translate(-50%, -50%) scale(1.2);
        }

        .gen-stop-btn:active {
          transform: scale(0.95);
        }

        .gen-stop-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .gen-loading-ring {
          position: absolute;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transition: all 0.2s ease;
        }

        .gen-loading-ring:before {
          content: "";
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: ${theme.accent || "#1a73e8"};
          border-left-color: ${theme.accent || "#1a73e8"};
          animation: genStopRing 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          transition: all 0.2s ease;
        }

        .gen-stop-square {
          width: 8px;
          height: 8px;
          background-color: ${theme.textSecondary || "#555"};
          border-radius: 1px;
          transition: all 0.2s ease;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }

        @keyframes genStopRing {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default RobotMessage;
