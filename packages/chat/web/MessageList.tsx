import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  memo,
  useMemo,
} from "react";
import { MessageItem } from "./MessageItem";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { useTheme } from "app/theme";
import { useAppSelector, useAppDispatch } from "app/hooks";
import {
  selectMergedMessages,
  selectIsLoadingInitial,
  selectIsLoadingOlder,
  selectHasMoreOlder,
  loadOlderMessages,
} from "chat/messages/messageSlice";
import type { Message } from "./types";

// --- Top Loading Indicator Component ---
const spinKeyframes = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
const TopLoadingIndicator = () => {
  const theme = useTheme();
  return (
    <>
      <style>{spinKeyframes}</style>
      <div className="chat-messages__loading-indicator-container">
        <div className="chat-messages__loading-indicator-spinner" />
      </div>
    </>
  );
};

// --- Constants ---
const LAZY_LOAD_THRESHOLD = 100;
const SCROLL_NEAR_BOTTOM_THRESHOLD = 150;
const SCROLL_DEBOUNCE_MS = 150;
const USER_ACTION_RESET_MS = 100;
const AVG_MESSAGE_HEIGHT_ESTIMATE = 100;
const LAZY_LOAD_BUFFER_SCREENS = 1;
const TOP_SCROLL_THRESHOLD = 50;

// --- Component Props ---
interface MessagesListProps {
  dialogId: string;
}

// --- MessagesList Component ---
const MessagesList: React.FC<MessagesListProps> = ({ dialogId }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // --- Redux State ---
  const displayMessages = useAppSelector(selectMergedMessages);
  const isLoadingInitial = useAppSelector(selectIsLoadingInitial);
  const isLoadingOlder = useAppSelector(selectIsLoadingOlder);
  const hasMoreOlder = useAppSelector(selectHasMoreOlder);

  // --- Refs ---
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollHeightRef = useRef(0);
  const scrollDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const userScrollActionRef = useRef(false);
  const isProcessingScrollRef = useRef(false);
  const scrollHeightBeforeLoadingOlderRef = useRef(0);
  const prevDisplayMessagesLengthRef = useRef(displayMessages.length);

  // --- State ---
  const [autoScroll, setAutoScroll] = useState(true);

  // --- Memoized Values for Lazy Loading/Virtualization ---
  const messageCount = displayMessages.length;
  const shouldUseLazyLoading = useMemo(
    () => messageCount > LAZY_LOAD_THRESHOLD,
    [messageCount]
  );

  const estimatedAvgHeight = useMemo(() => {
    if (!containerRef.current || messageCount === 0)
      return AVG_MESSAGE_HEIGHT_ESTIMATE;
    const scrollHeight = containerRef.current.scrollHeight;
    if (scrollHeight <= containerRef.current.clientHeight && messageCount > 0) {
      return AVG_MESSAGE_HEIGHT_ESTIMATE;
    }
    const calculatedAvg = scrollHeight / messageCount;
    return calculatedAvg > 20 && calculatedAvg < 1000
      ? calculatedAvg
      : AVG_MESSAGE_HEIGHT_ESTIMATE;
  }, [
    messageCount,
    containerRef.current?.scrollHeight,
    containerRef.current?.clientHeight,
  ]);

  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: Math.min(messageCount, 50),
  });

  const visibleMessages = useMemo(() => {
    if (!shouldUseLazyLoading) return displayMessages;
    const safeEnd = Math.min(visibleRange.end, messageCount);
    const safeStart = Math.max(0, visibleRange.start);
    return displayMessages.slice(safeStart, safeEnd);
  }, [displayMessages, visibleRange, shouldUseLazyLoading, messageCount]);

  // --- Callback Functions ---
  const isNearBottom = useCallback(() => {
    const elem = containerRef.current;
    if (!elem) return true;
    return (
      elem.scrollHeight - elem.scrollTop - elem.clientHeight <
      SCROLL_NEAR_BOTTOM_THRESHOLD
    );
  }, []);

  const scrollToBottom = useCallback((instant = false) => {
    const elem = containerRef.current;
    if (!elem) return;
    userScrollActionRef.current = true;
    elem.scrollTo({
      top: elem.scrollHeight,
      behavior: instant ? "auto" : "smooth",
    });
    setTimeout(() => {
      userScrollActionRef.current = false;
    }, USER_ACTION_RESET_MS);
  }, []);

  const handleLoadOlderMessages = useCallback(() => {
    if (isLoadingOlder || !hasMoreOlder || displayMessages.length === 0) {
      return;
    }
    const oldestMessage = displayMessages[0];
    const beforeKey =
      oldestMessage?._key ??
      (typeof oldestMessage?.id === "string" ? oldestMessage.id : null);
    if (
      !beforeKey ||
      (typeof beforeKey === "string" && beforeKey.startsWith("remote-"))
    ) {
      console.warn(
        "MessagesList: Cannot load older messages, invalid or remote-only 'beforeKey'.",
        oldestMessage
      );
      return;
    }
    console.log(
      `MessagesList: Attempting to load older messages before key: ${beforeKey}`
    );
    if (containerRef.current) {
      scrollHeightBeforeLoadingOlderRef.current =
        containerRef.current.scrollHeight;
    }
    dispatch(loadOlderMessages({ dialogId, beforeKey }));
  }, [dispatch, dialogId, displayMessages, hasMoreOlder, isLoadingOlder]);

  const handleScroll = useCallback(() => {
    const elem = containerRef.current;
    if (!elem || userScrollActionRef.current || isProcessingScrollRef.current) {
      return;
    }
    isProcessingScrollRef.current = true;
    const { scrollTop, scrollHeight, clientHeight } = elem;
    if (scrollTop < TOP_SCROLL_THRESHOLD && !isLoadingOlder && hasMoreOlder) {
      handleLoadOlderMessages();
    }
    const nearBottom = isNearBottom();
    if (!nearBottom && autoScroll) {
      setAutoScroll(false);
    } else if (nearBottom && !autoScroll) {
      setAutoScroll(true);
    }
    if (shouldUseLazyLoading) {
      const avgHeight = estimatedAvgHeight;
      const visibleItemsCount = Math.ceil(clientHeight / avgHeight);
      const buffer = Math.ceil(visibleItemsCount * LAZY_LOAD_BUFFER_SCREENS);
      const firstVisibleIndex = Math.max(0, Math.floor(scrollTop / avgHeight));
      const newStart = Math.max(0, firstVisibleIndex - buffer);
      const newEnd = Math.min(
        messageCount,
        firstVisibleIndex + visibleItemsCount + buffer
      );
      if (newStart !== visibleRange.start || newEnd !== visibleRange.end) {
        setVisibleRange({ start: newStart, end: newEnd });
      }
    }
    if (scrollDebounceTimerRef.current)
      clearTimeout(scrollDebounceTimerRef.current);
    scrollDebounceTimerRef.current = setTimeout(() => {
      userScrollActionRef.current = false;
    }, SCROLL_DEBOUNCE_MS);
    isProcessingScrollRef.current = false;
  }, [
    autoScroll,
    estimatedAvgHeight,
    handleLoadOlderMessages,
    hasMoreOlder,
    isLoadingOlder,
    isNearBottom,
    messageCount,
    shouldUseLazyLoading,
    visibleRange,
  ]);

  // --- Effects ---
  useEffect(() => {
    const elem = containerRef.current;
    if (!elem) return;
    elem.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      elem.removeEventListener("scroll", handleScroll);
      if (scrollDebounceTimerRef.current) {
        clearTimeout(scrollDebounceTimerRef.current);
      }
    };
  }, [handleScroll]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const currentMessageCount = displayMessages.length;
    const prevMessageCount = prevDisplayMessagesLengthRef.current;
    const messagesAddedCount = currentMessageCount - prevMessageCount;
    if (
      scrollHeightBeforeLoadingOlderRef.current > 0 &&
      messagesAddedCount > 0
    ) {
      const currentScrollHeight = container.scrollHeight;
      const scrollHeightDiff =
        currentScrollHeight - scrollHeightBeforeLoadingOlderRef.current;
      if (scrollHeightDiff > 5 && !autoScroll) {
        container.scrollTop += scrollHeightDiff;
        console.log(
          `MessagesList (LayoutEffect): Restored scroll position by ${scrollHeightDiff}px after prepending.`
        );
      }
      scrollHeightBeforeLoadingOlderRef.current = 0;
    }
    const newMessagesAppended =
      messagesAddedCount > 0 && currentMessageCount > prevMessageCount;
    if (
      autoScroll &&
      (prevMessageCount === 0 ||
        newMessagesAppended ||
        (!isLoadingInitial && currentMessageCount > 0))
    ) {
      const instant = prevMessageCount === 0 || messagesAddedCount > 1;
      scrollToBottom(instant);
      console.log(
        `MessagesList (LayoutEffect): Auto-scrolled to bottom (instant: ${instant}) due to ${
          prevMessageCount === 0
            ? "initial load"
            : newMessagesAppended
              ? "new messages"
              : "initial load completed"
        }.`
      );
    }
    prevDisplayMessagesLengthRef.current = currentMessageCount;
  }, [displayMessages, autoScroll, scrollToBottom, isLoadingInitial]);

  const handleScrollToBottomClick = useCallback(() => {
    setAutoScroll(true);
    scrollToBottom(false);
  }, [scrollToBottom]);

  const renderPlaceholders = () => {
    if (!shouldUseLazyLoading || !containerRef.current) return null;
    const avgHeight = estimatedAvgHeight;
    const topPlaceholderHeight = visibleRange.start * avgHeight;
    const bottomItemsCount = Math.max(0, messageCount - visibleRange.end);
    const bottomPlaceholderHeight = bottomItemsCount * avgHeight;
    return (
      <>
        {topPlaceholderHeight > 0 && (
          <div
            className="chat-messages__placeholder--top"
            style={{ height: `${topPlaceholderHeight}px` }}
            aria-hidden="true"
          />
        )}
        {bottomPlaceholderHeight > 0 && (
          <div
            className="chat-messages__placeholder--bottom"
            style={{ height: `${bottomPlaceholderHeight}px` }}
            aria-hidden="true"
          />
        )}
      </>
    );
  };

  return (
    <div className="chat-messages__container">
      <div
        ref={containerRef}
        className="chat-messages__list"
        role="log"
        aria-live="polite"
      >
        {isLoadingOlder && <TopLoadingIndicator />}
        {renderPlaceholders()}
        {visibleMessages.map((message, index) => {
          const realIndex = shouldUseLazyLoading
            ? visibleRange.start + index
            : index;
          const key = message.id || `msg-fallback-${realIndex}`;
          return (
            <div key={key} className="chat-messages__item-wrapper">
              <MemoizedMessageItem message={message as Message} />
            </div>
          );
        })}
      </div>
      <ScrollToBottomButton
        isVisible={!autoScroll && !!containerRef.current}
        onClick={handleScrollToBottomClick}
      />
      <style jsx>{`
        @keyframes chat-messages__message-appear {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-messages__container {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          background-color: ${theme.background};
          overflow: hidden;
        }

        .chat-messages__list {
          flex: 1 1 auto;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px 15%;
          scroll-behavior: auto;
          overscroll-behavior: contain;
          z-index: 1;
          scrollbar-width: thin;
          scrollbar-color: ${theme.border || "#ccc"} transparent;
        }

        .chat-messages__list::-webkit-scrollbar {
          width: 8px;
        }

        .chat-messages__list::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-messages__list::-webkit-scrollbar-thumb {
          background-color: ${theme.border || "#ccc"};
          border-radius: 4px;
          border: 2px solid ${theme.background || "#fff"};
        }

        .chat-messages__list::-webkit-scrollbar-thumb:hover {
          background-color: ${theme.borderHover || "#aaa"};
        }

        .chat-messages__item-wrapper {
          opacity: 0;
          transform: translateY(15px);
          animation: chat-messages__message-appear 0.3s ease-out forwards;
          animation-delay: ${Math.min(
            (typeof index !== "undefined" ? index : 0) * 0.03,
            0.5
          )}s;
          will-change: transform, opacity;
        }

        .chat-messages__placeholder--top,
        .chat-messages__placeholder--bottom {
          flex-shrink: 0;
        }

        .chat-messages__loading-indicator-container {
          display: flex;
          justify-content: center;
          padding: 10px 0;
        }

        .chat-messages__loading-indicator-spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-top-color: ${theme.primary || "#09f"};
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 1024px) {
          .chat-messages__list {
            padding: 20px 10%;
          }
        }

        @media (max-width: 768px) {
          .chat-messages__list {
            padding: 16px 12px;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

// Memoize MessageItem for performance optimization
const MemoizedMessageItem = memo(MessageItem);

export default MessagesList;
