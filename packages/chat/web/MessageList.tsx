import React, {
  useCallback,
  useEffect,
  useLayoutEffect, // Import useLayoutEffect
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
  // selectMessagesState, // Use specific selectors below
  selectIsLoadingOlder,
  selectHasMoreOlder,
  loadOlderMessages,
} from "chat/messages/messageSlice";
import type { Message } from "./types"; // Import Message type if needed for casting or checks

// --- Top Loading Indicator Component (Consider moving to a separate file) ---
const spinKeyframes = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
const TopLoadingIndicator = () => {
  const theme = useTheme();
  return (
    <>
      {/* Ensure keyframes are available */}
      <style>{spinKeyframes}</style>
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
        />
      </div>
    </>
  );
};

// --- Constants ---
const LAZY_LOAD_THRESHOLD = 100;
const SCROLL_NEAR_BOTTOM_THRESHOLD = 150;
const SCROLL_DEBOUNCE_MS = 150; // Debounce for user scroll detection reset
const USER_ACTION_RESET_MS = 100; // Time after programmatic scroll to ignore scroll events
const AVG_MESSAGE_HEIGHT_ESTIMATE = 100;
const LAZY_LOAD_BUFFER_SCREENS = 1;
const TOP_SCROLL_THRESHOLD = 50;
// OLDER_LOAD_LIMIT is used in dispatch, not directly here now

// --- Component Props ---
interface MessagesListProps {
  dialogId: string;
}

// --- MessagesList Component ---
const MessagesList: React.FC<MessagesListProps> = ({ dialogId }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // --- Redux State ---
  const displayMessages = useAppSelector(selectMergedMessages); // Use the selector that provides the final list
  const isLoadingOlder = useAppSelector(selectIsLoadingOlder);
  const hasMoreOlder = useAppSelector(selectHasMoreOlder);

  // --- Refs ---
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollHeightRef = useRef(0);
  const scrollDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  ); // Use correct timer type
  const userScrollActionRef = useRef(false); // Flag to ignore scroll events caused by code
  const isProcessingScrollRef = useRef(false); // Prevent re-entrant scroll handling
  const scrollHeightBeforeLoadingOlderRef = useRef(0); // Store height before prepend
  const prevDisplayMessagesLengthRef = useRef(displayMessages.length); // Track length changes

  // --- State ---
  const [autoScroll, setAutoScroll] = useState(true); // Auto-scroll enabled?

  // --- Memoized Values for Lazy Loading/Virtualization ---
  // Note: This is range-based lazy loading, not true virtualization.
  // For very large lists, consider libraries like react-window or react-virtualized.
  const messageCount = displayMessages.length;
  const shouldUseLazyLoading = useMemo(
    () => messageCount > LAZY_LOAD_THRESHOLD,
    [messageCount]
  );

  const estimatedAvgHeight = useMemo(() => {
    // Improved estimation logic (optional)
    if (!containerRef.current || messageCount === 0)
      return AVG_MESSAGE_HEIGHT_ESTIMATE;
    // Only calculate if scrollHeight seems valid
    const scrollHeight = containerRef.current.scrollHeight;
    if (scrollHeight <= containerRef.current.clientHeight && messageCount > 0) {
      // If content doesn't fill viewport, estimate based on rendered items maybe? Or stick to default.
      // This case is tricky. Sticking to default or a measured average might be safer.
      return AVG_MESSAGE_HEIGHT_ESTIMATE;
    }
    const calculatedAvg = scrollHeight / messageCount;
    // Use calculated average only if it's within a reasonable range
    return calculatedAvg > 20 && calculatedAvg < 1000
      ? calculatedAvg
      : AVG_MESSAGE_HEIGHT_ESTIMATE;
  }, [
    messageCount,
    containerRef.current?.scrollHeight,
    containerRef.current?.clientHeight,
  ]); // Re-calculate if container size changes too

  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: Math.min(messageCount, 50),
  }); // Initial range

  const visibleMessages = useMemo(() => {
    if (!shouldUseLazyLoading) return displayMessages;
    // Ensure end index doesn't exceed actual message count
    const safeEnd = Math.min(visibleRange.end, messageCount);
    const safeStart = Math.max(0, visibleRange.start); // Ensure start is not negative
    return displayMessages.slice(safeStart, safeEnd);
  }, [displayMessages, visibleRange, shouldUseLazyLoading, messageCount]);

  // --- Callback Functions ---

  // Check if scroll is near the bottom
  const isNearBottom = useCallback(() => {
    const elem = containerRef.current;
    if (!elem) return true; // Assume near bottom if element doesn't exist
    return (
      elem.scrollHeight - elem.scrollTop - elem.clientHeight <
      SCROLL_NEAR_BOTTOM_THRESHOLD
    );
  }, []); // No dependencies needed

  // Programmatically scroll to bottom
  const scrollToBottom = useCallback((instant = false) => {
    const elem = containerRef.current;
    if (!elem) return;

    userScrollActionRef.current = true; // Mark as programmatic scroll
    elem.scrollTo({
      top: elem.scrollHeight,
      behavior: instant ? "auto" : "smooth",
    });
    // Reset the user action flag shortly after, allowing user scroll detection again
    const timer = setTimeout(() => {
      userScrollActionRef.current = false;
    }, USER_ACTION_RESET_MS);
    // We might not need to tie setAutoScroll(true) directly to this action anymore,
    // handleScroll should manage the autoScroll state based on user position.
    // if (!autoScroll) setAutoScroll(true); // Maybe remove this, let handleScroll decide

    // Clear timer on cleanup or next call if needed (though short timeout makes it less critical)
  }, []); // Dependency: autoScroll removed

  // Trigger loading older messages
  const handleLoadOlderMessages = useCallback(() => {
    // Prevent concurrent loads or loading when no more exist
    if (isLoadingOlder || !hasMoreOlder || displayMessages.length === 0) {
      return;
    }

    // Get the key of the *actual* first message in the full list
    const oldestMessage = displayMessages[0];
    // Use _key if available (from local DB), otherwise fallback to id. Ensure it's a string.
    const beforeKey =
      oldestMessage?._key ??
      (typeof oldestMessage?.id === "string" ? oldestMessage.id : null);

    // Important: Check if we have a valid key to paginate from.
    // Avoids issues if the first message is temporary or lacks a stable key.
    // The `remote-` check might be specific to your key generation, adjust if needed.
    if (
      !beforeKey ||
      (typeof beforeKey === "string" && beforeKey.startsWith("remote-"))
    ) {
      console.warn(
        "MessagesList: Cannot load older messages, invalid or remote-only 'beforeKey'.",
        oldestMessage
      );
      return; // Stop if key is unsuitable for pagination
    }

    console.log(
      `MessagesList: Attempting to load older messages before key: ${beforeKey}`
    );
    // Record scroll height *before* dispatching the action
    if (containerRef.current) {
      scrollHeightBeforeLoadingOlderRef.current =
        containerRef.current.scrollHeight;
    }
    dispatch(loadOlderMessages({ dialogId, beforeKey })); // Limit is handled within the thunk now
  }, [dispatch, dialogId, displayMessages, hasMoreOlder, isLoadingOlder]);

  // Handle user scroll events
  const handleScroll = useCallback(() => {
    const elem = containerRef.current;
    // Exit if element doesn't exist, if a programmatic scroll is happening, or if already processing
    if (!elem || userScrollActionRef.current || isProcessingScrollRef.current) {
      return;
    }

    isProcessingScrollRef.current = true; // Lock processing

    const { scrollTop, scrollHeight, clientHeight } = elem;

    // --- 1. Load Older Messages Trigger ---
    // Check if scrolled near the top and conditions allow loading
    if (scrollTop < TOP_SCROLL_THRESHOLD && !isLoadingOlder && hasMoreOlder) {
      handleLoadOlderMessages();
    }

    // --- 2. Update Auto-Scroll State ---
    // Determine if user scrolled up away from the bottom
    const nearBottom = isNearBottom();
    if (!nearBottom && autoScroll) {
      // User scrolled up, disable auto-scroll
      setAutoScroll(false);
    } else if (nearBottom && !autoScroll) {
      // User scrolled back to the bottom, re-enable auto-scroll
      setAutoScroll(true);
    }

    // --- 3. Update Lazy Loading Visible Range ---
    if (shouldUseLazyLoading) {
      const avgHeight = estimatedAvgHeight; // Use memoized estimate
      const visibleItemsCount = Math.ceil(clientHeight / avgHeight);
      const buffer = Math.ceil(visibleItemsCount * LAZY_LOAD_BUFFER_SCREENS); // Items to render outside viewport

      // Calculate the index of the first theoretically visible item
      const firstVisibleIndex = Math.max(0, Math.floor(scrollTop / avgHeight));

      // Calculate new start and end indices for rendering
      const newStart = Math.max(0, firstVisibleIndex - buffer);
      const newEnd = Math.min(
        messageCount,
        firstVisibleIndex + visibleItemsCount + buffer
      );

      // Update state only if the range actually changes
      if (newStart !== visibleRange.start || newEnd !== visibleRange.end) {
        setVisibleRange({ start: newStart, end: newEnd });
      }
    }

    // --- Debounce reset for user action flag (optional but can help) ---
    // This ensures that even if programmatic scrolls happen quickly,
    // the user flag eventually resets if no coded scroll occurred recently.
    if (scrollDebounceTimerRef.current)
      clearTimeout(scrollDebounceTimerRef.current);
    scrollDebounceTimerRef.current = setTimeout(() => {
      userScrollActionRef.current = false; // Allow user scroll detection again
    }, SCROLL_DEBOUNCE_MS);

    isProcessingScrollRef.current = false; // Unlock processing
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

  // Effect to attach and detach scroll listener
  useEffect(() => {
    const elem = containerRef.current;
    if (!elem) return;

    // Add listener
    elem.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup: remove listener and clear any pending timers
    return () => {
      elem.removeEventListener("scroll", handleScroll);
      if (scrollDebounceTimerRef.current) {
        clearTimeout(scrollDebounceTimerRef.current);
      }
    };
  }, [handleScroll]); // Re-attach if handleScroll changes

  // Effect to handle scroll position AFTER messages are added/prepended
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const currentMessageCount = displayMessages.length;
    const prevMessageCount = prevDisplayMessagesLengthRef.current;
    const messagesAddedCount = currentMessageCount - prevMessageCount;

    // --- 1. Restore Scroll Position After Prepending (Loading Older) ---
    // If scrollHeightBeforeLoadingOlderRef has a value, it means we loaded older messages.
    if (
      scrollHeightBeforeLoadingOlderRef.current > 0 &&
      messagesAddedCount > 0
    ) {
      const currentScrollHeight = container.scrollHeight;
      const scrollHeightDiff =
        currentScrollHeight - scrollHeightBeforeLoadingOlderRef.current;

      // If height increased significantly and user wasn't at the bottom, adjust scroll
      if (scrollHeightDiff > 5 && !autoScroll) {
        // Only adjust if not auto-scrolling
        container.scrollTop += scrollHeightDiff;
        console.log(
          `MessagesList (LayoutEffect): Restored scroll position by ${scrollHeightDiff}px after prepending.`
        );
      }
      // Reset the reference height after adjustment
      scrollHeightBeforeLoadingOlderRef.current = 0;
    }

    // --- 2. Auto-Scroll on New Appended Messages ---
    const newMessagesAppended =
      messagesAddedCount > 0 && currentMessageCount > prevMessageCount;
    // Scroll if auto-scroll is enabled AND (it was initially empty OR new messages were appended)
    if (autoScroll && (prevMessageCount === 0 || newMessagesAppended)) {
      // Determine if instant scroll is needed (initial load or many messages added)
      const instant = prevMessageCount === 0 || messagesAddedCount > 1;
      scrollToBottom(instant);
    }

    // --- 3. Update References for Next Render ---
    prevDisplayMessagesLengthRef.current = currentMessageCount;
    // We might not need lastScrollHeightRef if using scrollHeightBeforeLoadingOlderRef logic

    // Dependencies: Monitor changes in messages and autoScroll state.
    // scrollToBottom is stable due to useCallback.
  }, [displayMessages, autoScroll, scrollToBottom]);

  // Scroll to bottom button click handler
  const handleScrollToBottomClick = useCallback(() => {
    setAutoScroll(true); // Re-enable auto-scroll when button is clicked
    scrollToBottom(false); // Perform smooth scroll
  }, [scrollToBottom]);

  // --- Render Functions ---

  // Render placeholder divs for lazy loading
  const renderPlaceholders = () => {
    if (!shouldUseLazyLoading || !containerRef.current) return null;

    // Use estimated height for placeholders
    const avgHeight = estimatedAvgHeight;
    const topPlaceholderHeight = visibleRange.start * avgHeight;
    // Calculate remaining items below the visible range
    const bottomItemsCount = Math.max(0, messageCount - visibleRange.end);
    const bottomPlaceholderHeight = bottomItemsCount * avgHeight;

    return (
      <>
        {topPlaceholderHeight > 0 && (
          <div
            style={{ height: `${topPlaceholderHeight}px`, flexShrink: 0 }}
            aria-hidden="true"
          />
        )}
        {bottomPlaceholderHeight > 0 && (
          <div
            style={{ height: `${bottomPlaceholderHeight}px`, flexShrink: 0 }}
            aria-hidden="true"
          />
        )}
      </>
    );
  };

  // --- Final Render ---
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        backgroundColor: theme.background,
        overflow: "hidden", // Container clips content
      }}
      className="chat-messages-container"
    >
      <div
        ref={containerRef}
        style={{
          flex: "1 1 auto", // Allow shrinking/growing, basis auto
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: "16px", // Consistent gap between items/placeholders
          padding: "24px 15%", // Responsive padding handled by CSS below
          scrollBehavior: "auto", // Let JS handle smooth scroll
          overscrollBehavior: "contain", // Prevent parent scrolling
          zIndex: 1, // Ensure content is above potential background elements
          // Styles for scrollbar are in CSS below
        }}
        className="chat-message-list" // Class for CSS styling
        role="log"
        aria-live="polite" // Announce changes politely
      >
        {/* Loading indicator at the top when fetching older messages */}
        {isLoadingOlder && <TopLoadingIndicator />}

        {/* Render top placeholder, visible messages, then bottom placeholder */}
        {renderPlaceholders()}
        {visibleMessages.map((message, index) => {
          // Calculate the message's actual index in the full displayMessages array
          const realIndex = shouldUseLazyLoading
            ? visibleRange.start + index
            : index;
          // Generate a stable key: use message.id primarily
          const key = message.id || `msg-fallback-${realIndex}`;
          return (
            // Wrapper for potential future styling or item-specific logic
            <div key={key} className="chat-message-item-wrapper">
              <MemoizedMessageItem message={message as Message} />
            </div>
          );
        })}
      </div>

      {/* Scroll to Bottom Button */}
      <ScrollToBottomButton
        isVisible={!autoScroll && !!containerRef.current} // Show when not auto-scrolling
        onClick={handleScrollToBottomClick}
      />

      {/* Component-specific styles using style jsx */}
      <style jsx>{`
        /* Keyframes for message appearance */
        @keyframes chatMessageAppear {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-message-list {
          /* Basic scrollbar styling */
          scrollbar-width: thin;
          scrollbar-color: ${theme.border || "#ccc"} transparent; /* Use theme */
        }
        /* Webkit scrollbar styling */
        .chat-message-list::-webkit-scrollbar {
          width: 8px;
        }
        .chat-message-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-message-list::-webkit-scrollbar-thumb {
          background-color: ${theme.border || "#ccc"}; /* Use theme */
          border-radius: 4px;
          /* Optional: border to match background for inset look */
          border: 2px solid ${theme.background || "#fff"};
        }
        .chat-message-list::-webkit-scrollbar-thumb:hover {
          background-color: ${theme.borderHover || "#aaa"}; /* Use theme */
        }

        .chat-message-item-wrapper {
          /* Staggered appearance animation */
          opacity: 0;
          transform: translateY(15px);
          animation: chatMessageAppear 0.3s ease-out forwards;
          /* Delay calculation based on index - keep simple */
          animation-delay: ${Math.min(
            (typeof index !== "undefined" ? index : 0) * 0.03, // Use index if available
            0.5
          )}s;
          will-change: transform, opacity; /* Optimize animation */
        }

        /* Responsive padding adjustments */
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
    </div>
  );
};

// Memoize MessageItem for performance optimization
const MemoizedMessageItem = memo(MessageItem);

export default MessagesList;
