import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { throttle } from "lodash";
import { reverse } from "rambda";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageItem } from "./MessageItem";
import { initMessages } from "./messageSlice";
import { selectMergedMessages, selectStreamMessages } from "./selector";
import { useTheme } from "app/theme";

const MessagesList: React.FC = () => {
  const theme = useTheme();
  const PAGE_SIZE = 6;
  const INITIAL_SIZE = PAGE_SIZE * 2;

  const [displayCount, setDisplayCount] = useState(INITIAL_SIZE);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const dispatch = useAppDispatch();
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const messages = useAppSelector(selectMergedMessages);
  const streamingMessages = useAppSelector(selectStreamMessages);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const id = currentDialogConfig.messageListId;
  if (!id) return <div>No message list ID</div>;

  const { data, isLoading, error } = useFetchData(id);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || !hasMore || isLoadingMore) return;

    const scrollBuffer = 100;
    const isNearTop = container.scrollTop < scrollBuffer;

    if (isNearTop) {
      setIsLoadingMore(true);
      const newDisplayCount = displayCount + PAGE_SIZE;
      setDisplayCount(newDisplayCount);

      if (newDisplayCount >= messages.length) {
        setHasMore(false);
      }
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, displayCount, messages.length]);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);
  //todo  change to message start
  useEffect(() => {
    if (streamingMessages) scrollToBottom();
  }, [streamingMessages, scrollToBottom]);

  useEffect(() => {
    if (data) {
      dispatch(initMessages(reverse(data.array)));
      setHasMore(data.array.length > INITIAL_SIZE);
      setDisplayCount(INITIAL_SIZE);
    }
    return () => {
      dispatch(initMessages([]));
      setHasMore(true);
      setDisplayCount(INITIAL_SIZE);
    };
  }, [data, dispatch, INITIAL_SIZE]);

  const throttledScroll = useCallback(throttle(handleScroll, 200), [
    handleScroll,
  ]);

  return (
    <>


      <div className="messages-container">
        {isLoading ? (
          <div className="messages-loading">加载中...</div>
        ) : error ? (
          <div className="messages-error">
            {error.message || "无法加载消息"}
          </div>
        ) : (
          <div
            ref={containerRef}
            className="message-list"
            onScroll={throttledScroll}
          >
            {messages.slice(0, displayCount).map((message, index) => (
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
            {hasMore && displayCount < messages.length && (
              <div className="messages-loading">
                {isLoadingMore ? "加载中..." : "向上滚动加载更多"}
              </div>
            )}
          </div>
        )}
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

          .messages-loading {
            display: flex;
            justify-content: center;
            padding: 20px;
            color: ${theme.textSecondary};
          }

          .messages-error {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            color: ${theme.textSecondary};
            text-align: center;
            padding: 16px;
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
