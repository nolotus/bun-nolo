// SelfMessage.jsx
import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { Avatar } from "render/ui";
import { selectTheme } from "app/theme/themeSlice";
import { MessageContent } from "./MessageContent";
import { MessageActions } from "./MessageActions";

export const SelfMessage = ({ content, dbKey }) => {
  const theme = useSelector(selectTheme);
  const messageRef = useRef(null);

  return (
    <>
      <div className="chat-message-container chat-message-self">
        <div
          className="chat-message-content-wrapper chat-message-self"
          ref={messageRef}
        >
          <div className="chat-message-avatar-wrapper">
            <Avatar name="user" />
          </div>
          <div className="chat-message-content-container">
            <div className="chat-message-bubble">
              <MessageContent content={content} role="self" />
            </div>

            {/* 使用共享的MessageActions组件 */}
            <MessageActions content={content} dbKey={dbKey} showSave={false} />
          </div>
        </div>
      </div>

      <style href="self-msg" precedence="medium">{`
        .chat-message-container {
          display: flex;
          margin-bottom: 18px;
          padding: 0 16px;
        }

        .chat-message-container.chat-message-self {
          justify-content: flex-end;
        }

        .chat-message-content-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
          max-width: 88%;
        }

        .chat-message-content-wrapper.chat-message-self {
          flex-direction: row-reverse;
        }

        .chat-message-avatar-wrapper {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .chat-message-content-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .chat-message-bubble {
          background-color: ${theme.primaryGhost || "rgba(22, 119, 255, 0.08)"};
          border-radius: 8px;
          padding: 14px 16px;
          color: ${theme.text};
          box-shadow: 0 1px 2px ${theme.shadowLight};
        }

        .chat-message-bubble:hover {
          background-color: ${theme.primaryHover || "rgba(22, 119, 255, 0.12)"};
        }
      `}</style>
    </>
  );
};
