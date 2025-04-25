// src/chat/messages/MessagesList.jsx
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
  useMemo,
} from "react";
import { MessageItem } from "./MessageItem";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { useTheme } from "app/theme";
import type { Message } from "../messages/types"; // Base message type
import type { MessageWithKey } from "../messages/fetchMessages"; // Type with _key from useMessages
import { useAppSelector } from "app/hooks";
import { selectMsgs, selectStreamMessages } from "chat/messages/messageSlice"; // Selectors for Redux state
import { sort } from "rambda"; // For final sorting

const MemoizedMessageItem = memo(MessageItem);

// --- Loading Indicator Component ---
const spinKeyframes = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
const TopLoadingIndicator = () => {
  const theme = useTheme();
  return (
    <div
      style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}
    >
      <div
        style={{
          border: "3px solid rgba(0, 0, 0, 0.1)",
          borderTopColor: theme.primary || "#09f",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          animation: "spin 1s linear infinite",
        }}
      ></div>
    </div>
  );
};

// --- Constants ---
const LAZY_LOAD_THRESHOLD = 100;
const SCROLL_NEAR_BOTTOM_THRESHOLD = 150;
const SCROLL_DEBOUNCE_MS = 150;
const USER_ACTION_RESET_MS = 100;
const AVG_MESSAGE_HEIGHT_ESTIMATE = 100;
const LAZY_LOAD_BUFFER_SCREENS = 1;
const TOP_SCROLL_THRESHOLD = 50; // Pixels from top to trigger load older

// --- Helper: compareMessagesByTime ---
const compareMessagesByTime = (a: Message, b: Message): number => {
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  if (aTime === bTime) return a.id.localeCompare(b.id);
  return aTime - bTime; // ASC sort (oldest first)
};

// --- Component Props ---
interface MessagesListProps {
  paginatedMessages: MessageWithKey[]; // From useMessages (ASC, with key)
  isLoadingOlder: boolean;
  hasMoreOlder: boolean;
  loadOlderMessages: () => Promise<void> | void;
  dialogId: string;
}

// --- MessagesList Component ---
const MessagesList: React.FC<MessagesListProps> = ({
  paginatedMessages,
  isLoadingOlder,
  hasMoreOlder,
  loadOlderMessages,
  dialogId,
}) => {
  const theme = useTheme();

  // --- Get latest Redux state ---
  const reduxMsgs = useAppSelector(selectMsgs); // Latest persisted msgs
  const streamMessages = useAppSelector(selectStreamMessages); // Live stream msgs

  // --- State and Refs ---
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastScrollHeightRef = useRef(0);
  const scrollDebounceTimerRef = useRef<number | null>(null);
  const userScrollActionRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const scrollHeightBeforeLoadingOlderRef = useRef(0); // Height before loading older
  const prevDisplayMessagesLengthRef = useRef(0); // Track length changes

  // --- Merge Data Sources ---
  const displayMessages = useMemo(() => {
    const displayMap = new Map<string, Message>(); // Use base Message type for display

    // 1. Add paginated messages (historical base)
    paginatedMessages.forEach((msg) => {
      if (msg?.id) displayMap.set(msg.id, msg);
    });

    // 2. Merge latest persisted messages from Redux
    reduxMsgs.forEach((reduxMsg) => {
      if (reduxMsg?.id) {
        const existing = displayMap.get(reduxMsg.id);
        // Simple merge: Redux state potentially newer/more complete
        displayMap.set(reduxMsg.id, { ...(existing || {}), ...reduxMsg });
      }
    });

    // 3. Merge stream messages (highest priority)
    streamMessages.forEach((streamMsg) => {
      if (streamMsg?.id) {
        const existing = displayMap.get(streamMsg.id);
        displayMap.set(streamMsg.id, { ...(existing || {}), ...streamMsg });
      }
    });

    // 4. Convert to array and sort ASC (oldest first) for rendering
    const combined = Array.from(displayMap.values());
    return sort(compareMessagesByTime, combined);
  }, [paginatedMessages, reduxMsgs, streamMessages]); // Dependencies

  // --- Virtualization (based on final displayMessages) ---
  const messageCount = displayMessages.length;
  const shouldUseLazyLoading = useMemo(
    () => messageCount > LAZY_LOAD_THRESHOLD,
    [messageCount]
  );
  const estimatedAvgHeight = useMemo(() => {
    if (!containerRef.current || messageCount === 0)
      return AVG_MESSAGE_HEIGHT_ESTIMATE;
    const calculatedAvg = containerRef.current.scrollHeight / messageCount;
    return calculatedAvg > 20 ? calculatedAvg : AVG_MESSAGE_HEIGHT_ESTIMATE;
  }, [messageCount, containerRef.current?.scrollHeight]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const visibleMessages = useMemo(() => {
    if (!shouldUseLazyLoading) return displayMessages;
    const endIndex = Math.min(visibleRange.end, messageCount);
    return displayMessages.slice(visibleRange.start, endIndex);
  }, [displayMessages, visibleRange, shouldUseLazyLoading, messageCount]);

  // --- Scrolling Logic ---
  const isNearBottom = useCallback(() => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return (
      scrollHeight <= clientHeight ||
      scrollHeight - scrollTop - clientHeight < SCROLL_NEAR_BOTTOM_THRESHOLD
    );
  }, []);

  const scrollToBottom = useCallback(
    (instant = false) => {
      if (!containerRef.current) return;
      userScrollActionRef.current = true;
      const targetScrollTop = containerRef.current.scrollHeight;
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: instant ? "auto" : "smooth",
      });
      const timer = setTimeout(() => {
        userScrollActionRef.current = false;
        if (!autoScroll) setAutoScroll(true);
      }, USER_ACTION_RESET_MS);
      // Consider clearing timer on unmount if necessary
    },
    [autoScroll]
  );

  // --- Handle Scroll Event ---
  const handleScroll = useCallback(() => {
    if (!containerRef.current || userScrollActionRef.current) return;
    const { scrollTop } = containerRef.current;

    // Debounce
    if (scrollDebounceTimerRef.current)
      clearTimeout(scrollDebounceTimerRef.current);
    scrollDebounceTimerRef.current = setTimeout(() => {
      userScrollActionRef.current = false;
    }, SCROLL_DEBOUNCE_MS);

    // Trigger Load Older
    if (scrollTop < TOP_SCROLL_THRESHOLD && !isLoadingOlder && hasMoreOlder) {
      scrollHeightBeforeLoadingOlderRef.current =
        containerRef.current.scrollHeight; // Record height BEFORE load
      loadOlderMessages();
    }

    // Update AutoScroll
    const scrollingDown = scrollTop > lastScrollTopRef.current;
    lastScrollTopRef.current = Math.max(0, scrollTop);
    const nearBottom = isNearBottom();
    if (!nearBottom && autoScroll) setAutoScroll(false);
    else if (nearBottom && !autoScroll && scrollingDown) setAutoScroll(true);

    // Update Lazy Loading Range
    if (shouldUseLazyLoading) {
      const { clientHeight } = containerRef.current;
      const avgHeight = estimatedAvgHeight;
      const visibleItems = Math.ceil(clientHeight / avgHeight);
      const bufferItems = visibleItems * LAZY_LOAD_BUFFER_SCREENS;
      const firstVisibleIndex = Math.max(0, Math.floor(scrollTop / avgHeight));
      const newStart = Math.max(0, firstVisibleIndex - bufferItems);
      const newEnd = Math.min(
        messageCount,
        firstVisibleIndex + visibleItems + bufferItems
      );
      if (newStart !== visibleRange.start || newEnd !== visibleRange.end) {
        setVisibleRange({ start: newStart, end: newEnd });
      }
    }
  }, [
    autoScroll,
    isNearBottom,
    shouldUseLazyLoading,
    messageCount,
    estimatedAvgHeight,
    visibleRange,
    isLoadingOlder,
    hasMoreOlder,
    loadOlderMessages,
  ]);

  // --- Effects ---

  // Attach scroll listener
  useEffect(() => {
    const elem = containerRef.current;
    if (!elem) return;
    lastScrollHeightRef.current = elem.scrollHeight;
    lastScrollTopRef.current = elem.scrollTop;
    elem.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      elem.removeEventListener("scroll", handleScroll);
      if (scrollDebounceTimerRef.current)
        clearTimeout(scrollDebounceTimerRef.current);
    };
  }, [handleScroll]);

  // Handle Message List Changes (Scroll Position & Auto-Scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const currentMessageCount = displayMessages.length;
    const prevMessageCount = prevDisplayMessagesLengthRef.current;
    const messagesAddedCount = currentMessageCount - prevMessageCount;

    const currentScrollHeight = container.scrollHeight;
    const scrollHeightDiff = currentScrollHeight - lastScrollHeightRef.current;

    // --- 1. Preserve Scroll on Prepend ---
    // If height increased significantly due to loading older messages, adjust scroll
    if (scrollHeightBeforeLoadingOlderRef.current > 0 && scrollHeightDiff > 0) {
      const adjustment =
        currentScrollHeight - scrollHeightBeforeLoadingOlderRef.current;
      if (adjustment > 5 && !autoScroll) {
        // Add threshold > 5px to avoid minor adjustments
        container.scrollTop += adjustment;
        console.log(
          `MessagesList: Adjusted scroll after prepend by ${adjustment}px`
        );
      }
      scrollHeightBeforeLoadingOlderRef.current = 0; // Reset ref
    }
    // --- 2. Auto Scroll on Append ---
    userScrollActionRef.current = true; // Prevent handleScroll interference
    const wasInitiallyEmpty = prevMessageCount === 0 && currentMessageCount > 0;
    const newMessagesAppended = messagesAddedCount > 0 && autoScroll;
    if (wasInitiallyEmpty || newMessagesAppended) {
      scrollToBottom(wasInitiallyEmpty || messagesAddedCount > 1); // Instant scroll if initial or many messages added
    }

    // --- 3. Update Refs ---
    prevDisplayMessagesLengthRef.current = currentMessageCount;
    lastScrollHeightRef.current = currentScrollHeight;
    const timer = setTimeout(() => {
      userScrollActionRef.current = false;
    }, USER_ACTION_RESET_MS);
    return () => clearTimeout(timer);
  }, [displayMessages, autoScroll, scrollToBottom]); // Depend on final displayMessages

  // Scroll to Bottom Button Click
  const handleScrollToBottomClick = useCallback(
    () => scrollToBottom(false),
    [scrollToBottom]
  );

  // Render Placeholders for Virtualization
  const renderPlaceholders = () => {
    if (!shouldUseLazyLoading) return null;
    const topPlaceholderHeight = visibleRange.start * estimatedAvgHeight;
    const bottomPlaceholderHeight =
      Math.max(0, messageCount - visibleRange.end) * estimatedAvgHeight;
    return (
      <>
        {topPlaceholderHeight > 0 && (
          <div
            className="messages-placeholder"
            style={{ height: `${topPlaceholderHeight}px` }}
            aria-hidden="true"
          />
        )}
        {bottomPlaceholderHeight > 0 && (
          <div
            className="messages-placeholder"
            style={{ height: `${bottomPlaceholderHeight}px` }}
            aria-hidden="true"
          />
        )}
      </>
    );
  };

  // --- Rendering ---
  return (
    <>
      <style>{spinKeyframes}</style> {/* Ensure spin animation is available */}
      <div className="chat-messages-container">
        <div
          ref={containerRef}
          className="chat-message-list"
          role="log"
          aria-live="polite"
        >
          {/* Top loading indicator */}
          {isLoadingOlder && <TopLoadingIndicator />}

          {/* Placeholders and Messages */}
          {renderPlaceholders()}
          {visibleMessages.map((message, index) => {
            const key =
              message.id || `msg-${dialogId}-${visibleRange.start + index}`;
            const realIndex = shouldUseLazyLoading
              ? visibleRange.start + index
              : index;
            return (
              <div
                key={key}
                className="chat-message-item-wrapper"
                style={{
                  animationDelay: `${Math.min(realIndex * 0.03, 0.5)}s`,
                }}
              >
                <MemoizedMessageItem message={message} />
              </div>
            );
          })}
        </div>

        {/* Scroll to bottom button */}
        <ScrollToBottomButton
          isVisible={!autoScroll && !!containerRef.current}
          onClick={handleScrollToBottomClick}
        />
      </div>
      {/* Styles */}
      <style jsx>{`
        .chat-messages-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          background-color: ${theme.background};
          overflow: hidden;
        }
        .chat-message-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px 15%;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-behavior: auto; /* Let JS control smooth scroll */
          -webkit-overflow-scrolling: touch;
          background-color: ${theme.background};
          overscroll-behavior: contain;
          z-index: 1;
        }
        .chat-message-list::-webkit-scrollbar {
          width: 8px;
        }
        .chat-message-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-message-list::-webkit-scrollbar-thumb {
          background-color: ${theme.border};
          border-radius: 4px;
          border: 2px solid ${theme.background};
        }
        .chat-message-list::-webkit-scrollbar-thumb:hover {
          background-color: ${theme.borderHover};
        }
        .chat-message-list {
          scrollbar-width: thin;
          scrollbar-color: ${theme.border} transparent;
        }
        .chat-message-item-wrapper {
          opacity: 0;
          transform: translateY(15px);
          animation: chatMessageAppear 0.3s ease-out forwards;
          will-change: transform, opacity;
        }
        .messages-placeholder {
          min-height: 1px;
          flex-shrink: 0;
          background: transparent;
        }
        @keyframes chatMessageAppear {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 1024px) {
          .chat-message-list {
            padding: 20px 10%;
          }
        }
        @media (max-width: 768px) {
          .chat-message-list {
            padding: 16px 12px;
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default MessagesList;
