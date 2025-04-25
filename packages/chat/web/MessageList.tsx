// MessagesList.jsx
import { useAppSelector } from "app/hooks";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 检查是否接近底部（距离底部100px内视为接近）
  const isNearBottom = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      return scrollHeight - scrollTop - clientHeight < 100;
    }
    return false;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  // 检测用户滚动行为
  const handleScroll = useCallback(() => {
    setIsUserScrolling(true);
    // 清除之前的超时
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    // 设置超时，超时后认为用户不再滚动
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2500); // 2.5秒后重置，用户停止滚动后恢复自动滚动
  }, []);

  // 监听用户滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // 当有流式传输消息时，检查是否需要自动滚动
  useEffect(() => {
    if (streamingMessages.length > 0) {
      // 如果用户接近底部或者未在滚动，则自动滚动到底部
      if (!isUserScrolling || isNearBottom()) {
        scrollToBottom();
      }
    }
  }, [streamingMessages, scrollToBottom, isUserScrolling, isNearBottom]);

  // 初次加载或消息更新时滚动到底部（如果用户未滚动或接近底部）
  useEffect(() => {
    if (!isUserScrolling || isNearBottom()) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, isUserScrolling, isNearBottom]);

  return (
    <>
      <div className="chat-messages-container">
        <div ref={containerRef} className="chat-message-list">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className="chat-message-item"
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
          .chat-messages-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
            background-color: ${theme.background};
          }

          .chat-message-list {
            flex: 1;
            display: flex;
            flex-direction: column; /* 正常顺序 */
            gap: 16px;
            padding: 24px 15%;
            overflow-y: auto;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            background-color: ${theme.background};
          }

          .chat-message-list::-webkit-scrollbar {
            width: 6px;
          }

          .chat-message-list::-webkit-scrollbar-track {
            background: transparent;
          }

          .chat-message-list::-webkit-scrollbar-thumb {
            background-color: ${theme.border};
            border-radius: 3px;
          }

          .chat-message-list::-webkit-scrollbar-thumb:hover {
            background-color: ${theme.borderHover};
          }

          /* Firefox scrollbar */
          .chat-message-list {
            scrollbar-width: thin;
            scrollbar-color: ${theme.border} transparent;
          }

          .chat-message-item {
            opacity: 0;
            transform: translateY(10px);
            animation: chatMessageAppear 0.2s ease forwards;
          }

          @keyframes chatMessageAppear {
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
            .chat-message-list {
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
