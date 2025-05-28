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
import { ScrollToBottomButton } from "../../web/ScrollToBottomButton";
import { useTheme } from "app/theme";
import { useAppSelector, useAppDispatch } from "app/hooks";
import {
  selectMergedMessages,
  selectIsLoadingInitial,
  selectIsLoadingOlder,
  selectHasMoreOlder,
  loadOlderMessages,
} from "chat/messages/messageSlice";
import TopLoadingIndicator from "./TopLoadingIndicator";
import type { Message } from "./types";

// --- Constants ---
const LAZY_LOAD_THRESHOLD = 100;
const SCROLL_NEAR_BOTTOM_THRESHOLD = 150;
const SCROLL_DEBOUNCE_MS = 150;
const USER_ACTION_RESET_MS = 100;
const AVG_MESSAGE_HEIGHT_ESTIMATE = 100;
const LAZY_LOAD_BUFFER_SCREENS = 1;
const TOP_SCROLL_THRESHOLD = 50;

// --- Custom Hook for Scroll Handling ---
const useScrollHandler = (
  containerRef: React.RefObject<HTMLDivElement>,
  autoScroll: boolean,
  setAutoScroll: React.Dispatch<React.SetStateAction<boolean>>,
  isLoadingOlder: boolean,
  hasMoreOlder: boolean,
  handleLoadOlderMessages: () => void,
  updateVisibleRange: () => void,
  shouldUseLazyLoading: boolean
) => {
  const userScrollActionRef = useRef(false);
  const isProcessingScrollRef = useRef(false);
  const scrollDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const isNearBottom = useCallback(() => {
    const elem = containerRef.current;
    if (!elem) return true;
    return (
      elem.scrollHeight - elem.scrollTop - elem.clientHeight <
      SCROLL_NEAR_BOTTOM_THRESHOLD
    );
  }, [containerRef]);

  const scrollToBottom = useCallback(
    (instant = false) => {
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
    },
    [containerRef]
  );

  const handleScroll = useCallback(() => {
    const elem = containerRef.current;
    if (!elem || userScrollActionRef.current || isProcessingScrollRef.current) {
      return;
    }
    isProcessingScrollRef.current = true;
    const { scrollTop } = elem;
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
      updateVisibleRange();
    }
    if (scrollDebounceTimerRef.current) {
      clearTimeout(scrollDebounceTimerRef.current);
    }
    scrollDebounceTimerRef.current = setTimeout(() => {
      userScrollActionRef.current = false;
    }, SCROLL_DEBOUNCE_MS);
    isProcessingScrollRef.current = false;
  }, [
    autoScroll,
    setAutoScroll,
    isNearBottom,
    handleLoadOlderMessages,
    isLoadingOlder,
    hasMoreOlder,
    containerRef,
    updateVisibleRange,
    shouldUseLazyLoading,
  ]);

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
  }, [handleScroll, containerRef]);

  return { scrollToBottom, isNearBottom };
};

// --- Custom Hook for Virtual List (Lazy Loading) - Optimized ---
const useVirtualList = (
  containerRef: React.RefObject<HTMLDivElement>,
  messages: Message[],
  shouldUseLazyLoading: boolean
) => {
  const messageCount = messages.length;
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: Math.min(messageCount, 50),
  });
  // 使用 useRef 存储平均高度，避免频繁状态更新
  const avgHeightRef = useRef<number>(AVG_MESSAGE_HEIGHT_ESTIMATE);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRangeRef = useRef(visibleRange);
  const lastHeightUpdateTimeRef = useRef<number>(0);
  const HEIGHT_UPDATE_INTERVAL = 500; // 高度更新最小间隔时间，单位：ms

  // 动态计算平均高度，基于已渲染的消息，并限制频率
  const updateAvgHeight = useCallback(() => {
    const now = Date.now();
    if (now - lastHeightUpdateTimeRef.current < HEIGHT_UPDATE_INTERVAL) {
      return; // 限制频率，避免频繁计算
    }
    lastHeightUpdateTimeRef.current = now;

    if (!containerRef.current || messageCount === 0) return;
    const visibleElements = containerRef.current.querySelectorAll(
      ".chat-messages__item-wrapper"
    );
    if (visibleElements.length > 0) {
      let totalHeight = 0;
      let count = 0;
      // 仅取前 10 个元素，减少 DOM 操作开销
      const maxElementsToCheck = Math.min(visibleElements.length, 10);
      for (let i = 0; i < maxElementsToCheck; i++) {
        const height = (visibleElements[i] as HTMLElement).offsetHeight;
        if (height > 0) {
          totalHeight += height;
          count++;
        }
      }
      if (count > 0) {
        const newAvgHeight = totalHeight / count;
        if (newAvgHeight > 20 && newAvgHeight < 1000) {
          avgHeightRef.current = newAvgHeight;
        }
      }
    }
  }, [containerRef, messageCount]);

  // 使用 ResizeObserver 监听高度变化（如图片加载完成）
  useEffect(() => {
    if (!shouldUseLazyLoading || !containerRef.current) return;
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        updateAvgHeight(); // 高度变化时重新计算
      });
      const container = containerRef.current;
      observer.observe(container);
    }
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [shouldUseLazyLoading, updateAvgHeight, containerRef]);

  // 可见消息列表
  const visibleMessages = useMemo(() => {
    if (!shouldUseLazyLoading) return messages;
    const safeEnd = Math.min(visibleRange.end, messageCount);
    const safeStart = Math.max(0, visibleRange.start);
    return messages.slice(safeStart, safeEnd);
  }, [messages, visibleRange, shouldUseLazyLoading, messageCount]);

  // 更新可见范围，带有节流机制
  const updateVisibleRange = useCallback(() => {
    const elem = containerRef.current;
    if (!elem || !shouldUseLazyLoading) return;
    const { scrollTop, clientHeight } = elem;
    const avgHeight = avgHeightRef.current;
    const visibleItemsCount = Math.ceil(clientHeight / avgHeight);
    const buffer = Math.ceil(visibleItemsCount * LAZY_LOAD_BUFFER_SCREENS);
    const firstVisibleIndex = Math.max(0, Math.floor(scrollTop / avgHeight));
    const newStart = Math.max(0, firstVisibleIndex - buffer);
    const newEnd = Math.min(
      messageCount,
      firstVisibleIndex + visibleItemsCount + buffer
    );

    // 只有当范围变化超过阈值时才更新，避免频繁渲染
    const rangeChangeThreshold = 5;
    if (
      Math.abs(newStart - lastRangeRef.current.start) > rangeChangeThreshold ||
      Math.abs(newEnd - lastRangeRef.current.end) > rangeChangeThreshold
    ) {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      updateTimerRef.current = setTimeout(() => {
        setVisibleRange({ start: newStart, end: newEnd });
        lastRangeRef.current = { start: newStart, end: newEnd };
        updateAvgHeight(); // 更新范围后重新计算高度
      }, 100); // 节流时间，100ms
    }
  }, [containerRef, messageCount, shouldUseLazyLoading, updateAvgHeight]);

  // 渲染顶部和底部的占位符
  const renderPlaceholders = useCallback(() => {
    if (!shouldUseLazyLoading || !containerRef.current) return null;
    const avgHeight = avgHeightRef.current;
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
  }, [shouldUseLazyLoading, visibleRange, messageCount, containerRef]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  // 初始化时计算平均高度
  useEffect(() => {
    if (shouldUseLazyLoading && messageCount > 0) {
      updateAvgHeight();
    }
  }, [shouldUseLazyLoading, messageCount, updateAvgHeight]);

  return { visibleMessages, renderPlaceholders, updateVisibleRange };
};

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

  // --- Scroll Handling Hook ---
  const handleLoadOlderMessages = useCallback(() => {
    if (isLoadingOlder || !hasMoreOlder || displayMessages.length === 0) return;
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

  // --- Virtual List Hook ---
  const { visibleMessages, renderPlaceholders, updateVisibleRange } =
    useVirtualList(containerRef, displayMessages, shouldUseLazyLoading);

  // --- Scroll Handling Hook with Merged Scroll Logic ---
  const { scrollToBottom } = useScrollHandler(
    containerRef,
    autoScroll,
    setAutoScroll,
    isLoadingOlder,
    hasMoreOlder,
    handleLoadOlderMessages,
    updateVisibleRange,
    shouldUseLazyLoading
  );

  // --- Layout Effect for Auto Scroll and Scroll Position Restoration ---
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
      <style>{`
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
          background-color: ${theme.background || "#fff"};
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
