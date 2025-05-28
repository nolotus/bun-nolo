// UserMessage.jsx
import type React from "react";
import { useRef } from "react";
import { Avatar } from "render/ui";

import { MessageContent } from "./MessageContent";
import { MessageActions } from "./MessageActions";

import type { Message } from "../types";
import { useTheme } from "app/theme";

export const UserMessage: React.FC<Message> = ({ content, dbKey }) => {
  const messageRef = useRef(null);
  const theme = useTheme();

  return (
    <>
      <div className="chat-message-container chat-message-other">
        <div className="chat-message-content-wrapper" ref={messageRef}>
          <div className="chat-message-avatar-wrapper">
            <Avatar name="user" />
          </div>
          <div className="chat-message-content-container">
            <div className="chat-user-message-content">
              <MessageContent content={content} role="other" />
            </div>

            {/* Action buttons - using the shared component */}
            <MessageActions
              content={content}
              dbkey={dbKey}
              showDelete={false}
            />
          </div>
        </div>
      </div>

      <style href="user-msg" precedence="medium">{`
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

        .chat-message-content-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .chat-user-message-content {
          background-color: ${theme.backgroundSecondary || "#f0f2f5"};
          border-radius: 8px;
          padding: 14px 16px;
          color: ${theme.text};
        }
      `}</style>
    </>
  );
};
