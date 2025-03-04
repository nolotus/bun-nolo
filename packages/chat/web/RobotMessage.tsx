// RobotMessage.jsx
import { StopIcon } from "@primer/octicons-react";
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useRef } from "react";
import { Avatar } from "render/ui";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "app/hooks";
import { MessageContent } from "./MessageContent";
import type { Message } from "../messages/types";
import { MessageActions } from "./MessageActions";

const RobotMessage: React.FC<Message> = ({ id, content, controller }) => {
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
            {controller && (
              <div
                className="chat-stop-generation-button"
                onClick={() => controller.abort()}
              >
                <StopIcon size={14} />
                <span>{t("stopGeneration")}</span>
              </div>
            )}

            <MessageContent content={content} role="other" />

            {/* 使用共享的MessageActions组件 */}
            <MessageActions content={content} id={id} />
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

        .chat-stop-generation-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          position: relative;
          margin-bottom: 8px;
          font-size: 13px;
          padding: 6px 12px;
          border-radius: 4px;
          background-color: ${theme.backgroundDanger};
          color: ${theme.textDanger};
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          font-weight: 500;
        }

        .chat-stop-generation-button:hover {
          background-color: ${
            theme.backgroundDangerHover || theme.backgroundDanger
          };
          box-shadow: 0 1px 3px ${theme.shadowLight};
        }
      `}</style>
    </>
  );
};

export default RobotMessage;
