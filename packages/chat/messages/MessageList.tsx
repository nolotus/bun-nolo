import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { reverse } from "rambda";
import type React from "react";
import { useEffect, useRef } from "react";
import { defaultTheme } from "render/styles/colors";
import { MessageItem } from "./MessageItem";
import { initMessages } from "./messageSlice";
import { selectMergedMessages, selectStreamMessages } from "./selector";

const MessagesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const messages = useAppSelector(selectMergedMessages);
  const streamingMessages = useAppSelector(selectStreamMessages);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const id = currentDialogConfig.messageListId;
  if (!id) return <div>No message list ID</div>;

  const { data, isLoading, error } = useFetchData(id);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (streamingMessages) scrollToBottom();
  }, [streamingMessages, messages]);

  useEffect(() => {
    if (data) {
      dispatch(initMessages(reverse(data.array)));
    }
    return () => {
      dispatch(initMessages());
    };
  }, [data, dispatch]);

  return (
    <>
      <style>
        {`
          .messages-container {
            height: 100%;
            background-color: ${defaultTheme.background};
            position: relative;
          }

          .message-list {
            display: flex;
            flex-direction: column-reverse;
            gap: 16px;
            height: 100%;
            padding: 24px 15%;
            overflow-y: auto;
            scroll-behavior: smooth;
            position: relative;
            background-color: ${defaultTheme.background};
          }

          .message-list::-webkit-scrollbar {
            width: 6px;
          }

          .message-list::-webkit-scrollbar-track {
            background: transparent;
          }

          .message-list::-webkit-scrollbar-thumb {
            background-color: ${defaultTheme.border};
            border-radius: 3px;
          }

          .message-list::-webkit-scrollbar-thumb:hover {
            background-color: ${defaultTheme.borderHover};
          }

          .messages-loading-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0;
            animation: fadeIn 0.3s ease forwards;
          }

          .messages-loading-spinner {
            width: 36px;
            height: 36px;
            border: 3px solid ${defaultTheme.backgroundSecondary};
            border-top: 3px solid ${defaultTheme.primary};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .messages-error {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: ${defaultTheme.textSecondary};
            text-align: center;
            padding: 16px;
            opacity: 0;
            animation: fadeIn 0.3s ease forwards;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @media (max-width: 768px) {
            .message-list {
              padding: 16px 12px;
              gap: 12px;
            }
          }

          @media (min-width: 769px) and (max-width: 1024px) {
            .message-list {
              padding: 20px 10%;
              gap: 14px;
            }
          }

          @container (max-width: 768px) {
            .message-list {
              padding: 16px 12px;
              gap: 12px;
            }
          }

          @container (min-width: 769px) and (max-width: 1024px) {
            .message-list {
              padding: 20px 10%;
              gap: 14px;
            }
          }
        `}
      </style>

      <div className="messages-container">
        {isLoading ? (
          <div className="messages-loading-container">
            <div className="messages-loading-spinner" />
          </div>
        ) : error ? (
          <div className="messages-error">
            {error.message || "无法加载消息"}
          </div>
        ) : (
          <div ref={containerRef} className="message-list">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MessagesList;
