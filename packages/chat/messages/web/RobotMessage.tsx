// RobotMessage.jsx
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useRef } from "react";
import { Avatar } from "render/ui";
import { useAppSelector } from "app/hooks";
import { MessageContent } from "./MessageContent";
import type { Message } from "../types";
import { MessageActions } from "./MessageActions";
import { useFetchData } from "app/hooks"; // 假设 useFetchData 位于 app/hooks 文件夹中

const RobotMessage: React.FC<Message> = ({
  dbKey,
  content,
  cybotKey, // 保持 cybotKey，与 props 一致
}) => {
  const theme = useAppSelector(selectTheme);
  const messageRef = useRef(null);

  // 使用 useFetchData 钩子通过 cybotKey 获取数据，如果 cybotKey 不存在则不调用
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
                fontSize: "16px", // 字体大小从 14px 调整为 16px
                fontWeight: "bold",
                color: theme.text || "#000",
              }}
            >
              {!data || !data.name ? (
                // 如果没有数据或名称，则不显示任何内容
                <span></span>
              ) : (
                // 只有在有名称数据时才显示名称
                <span>{data.name}</span>
              )}
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
      `}</style>
    </>
  );
};

export default RobotMessage;
