import { useAppSelector } from "app/hooks";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import {
  selectMergedMessages,
  selectStreamMessages,
} from "../messages/selector";
import { useTheme } from "app/theme";

const MessagesList: React.FC = () => {
  const theme = useTheme();

  const messages = useAppSelector(selectMergedMessages);
  const streamingMessages = useAppSelector(selectStreamMessages);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);
  //todo  change to message start
  useEffect(() => {
    if (streamingMessages) scrollToBottom();
  }, [streamingMessages, scrollToBottom]);

  return (
    <>
      <div className="messages-container">
        <div ref={containerRef} className="message-list">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className="message-item"
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <MessageItem message={message} />
            </div>
          ))}
        </div>
      </div>
      <style>
        {`
          .messages-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
            background-color: ${theme.background};
          }

          .message-list {
            flex: 1;
            display: flex;
            flex-direction: column-reverse;
            gap: 16px;
            padding: 24px 15%;
            overflow-y: auto;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            background-color: ${theme.background};
          }

          .message-list::-webkit-scrollbar {
            width: 6px;
          }

          .message-list::-webkit-scrollbar-track {
            background: transparent;
          }

          .message-list::-webkit-scrollbar-thumb {
            background-color: ${theme.border};
            border-radius: 3px;
          }

          .message-list::-webkit-scrollbar-thumb:hover {
            background-color: ${theme.borderHover};
          }

          /* Firefox scrollbar */
          .message-list {
            scrollbar-width: thin;
            scrollbar-color: ${theme.border} transparent;
          }

          .message-item {
            opacity: 0;
            transform: translateY(10px);
            animation: messageAppear 0.2s ease forwards;
          }

          @keyframes messageAppear {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }



          @media (max-width: 768px) {
            .message-list {
              padding: 16px 12px;
              gap: 12px;
            }
          }
        `}
      </style>
    </>
  );
};

export default MessagesList;
