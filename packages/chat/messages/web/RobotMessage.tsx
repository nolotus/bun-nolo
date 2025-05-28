// RobotMessage.jsx
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useRef } from "react";
import { Avatar } from "render/ui";
import { useAppSelector } from "app/hooks";
import { MessageContent } from "./MessageContent";
import type { Message } from "../types";
import { MessageActions } from "./MessageActions";
import { useFetchData } from "app/hooks";

const RobotMessage: React.FC<Message> = ({ dbKey, content, cybotKey }) => {
  const theme = useAppSelector(selectTheme);
  const messageRef = useRef(null);

  const { data, isLoading, error } = cybotKey
    ? useFetchData(cybotKey)
    : { data: null, isLoading: false, error: null };

  return (
    <>
      <div className="chat-message-container chat-message-other">
        <div className="chat-message-content-wrapper">
          <div className="chat-message-avatar-wrapper">
            <Avatar name="robot" />
          </div>

          <div className="chat-robot-message-content" ref={messageRef}>
            <div
              className="message-header"
              style={{
                marginBottom: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                color: theme.text || "#000",
              }}
            >
              {!data || !data.name ? <span></span> : <span>{data.name}</span>}
            </div>
            <MessageContent content={content} role="other" />

            <div className="message-footer">
              <div className="footer-left"></div>
              <div className="footer-right">
                <MessageActions content={content} dbKey={dbKey} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <style href="robot-msg" precedence="medium">{`
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
    width: 100%;
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

  /* 响应式断点调整 */
  @media (max-width: 1024px) {
    .chat-message-content-wrapper {
      max-width: 90%;
    }
  }

  @media (max-width: 768px) {
    .chat-message-content-wrapper {
      max-width: 88%;
    }
  }

  @media (max-width: 480px) {
    .chat-message-content-wrapper {
      max-width: 95%;
    }
    .chat-message-container {
      padding: 0 8px;
    }
  }

  @media (max-width: 360px) {
    .chat-message-content-wrapper {
      max-width: 98%;
      gap: 8px;
    }
    .chat-message-container {
      padding: 0 4px;
      margin-bottom: 12px;
    }
    .chat-robot-message-content {
      padding: 2px 0;
    }
  }
`}</style>
    </>
  );
};

export default RobotMessage;
