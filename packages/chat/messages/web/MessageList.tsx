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

// --- Constants --- (优化：增加常量复用)
const LAZY_LOAD_THRESHOLD = 100;
const SCROLL_NEAR_BOTTOM_THRESHOLD = 150;
const SCROLL_DEBOUNCE_MS = 100; // 减少防抖时间，提升响应性
const USER_ACTION_RESET_MS = 80; // 减少用户操作重置时间
const AVG_MESSAGE_HEIGHT_ESTIMATE = 100;
const LAZY_LOAD_BUFFER_SCREENS = 1.5; // 增加缓冲区
const TOP_SCROLL_THRESHOLD = 50;
const HEIGHT_UPDATE_INTERVAL = 300; // 减少高度更新间隔
const RANGE_UPDATE_DEBOUNCE = 50; // 减少范围更新防抖时间

// --- Custom Hook for Scroll Handling --- (性能优化：减少重复计算)
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
  const lastScrollTopRef = useRef(0); // 新增：记录上次滚动位置

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

    const { scrollTop } = elem;

    // 优化：只有滚动距离超过阈值才处理
    const scrollDelta = Math.abs(scrollTop - lastScrollTopRef.current);
    if (scrollDelta < 5) return;
    lastScrollTopRef.current = scrollTop;

    isProcessingScrollRef.current = true;

    // 加载更多消息检查
    if (scrollTop < TOP_SCROLL_THRESHOLD && !isLoadingOlder && hasMoreOlder) {
      handleLoadOlderMessages();
    }

    // 自动滚动状态管理
    const nearBottom = isNearBottom();
    if (!nearBottom && autoScroll) {
      setAutoScroll(false);
    } else if (nearBottom && !autoScroll) {
      setAutoScroll(true);
    }

    // 虚拟列表更新
    if (shouldUseLazyLoading) {
      updateVisibleRange();
    }

    // 防抖处理
    if (scrollDebounceTimerRef.current) {
      clearTimeout(scrollDebounceTimerRef.current);
    }
    scrollDebounceTimerRef.current = setTimeout(() => {
      isProcessingScrollRef.current = false;
    }, SCROLL_DEBOUNCE_MS);
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

    // 使用 passive 监听器优化滚动性能
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

// --- Custom Hook for Virtual List --- (大幅性能优化)
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

  // 性能优化：使用 useRef 存储状态，减少重渲染
  const avgHeightRef = useRef<number>(AVG_MESSAGE_HEIGHT_ESTIMATE);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRangeRef = useRef(visibleRange);
  const lastHeightUpdateTimeRef = useRef<number>(0);
  const heightSamplesRef = useRef<number[]>([]); // 新增：高度样本池
  const observerRef = useRef<ResizeObserver | null>(null);

  // 优化高度计算：使用样本池平均
  const updateAvgHeight = useCallback(() => {
    const now = Date.now();
    if (now - lastHeightUpdateTimeRef.current < HEIGHT_UPDATE_INTERVAL) {
      return;
    }
    lastHeightUpdateTimeRef.current = now;

    if (!containerRef.current || messageCount === 0) return;

    const visibleElements = containerRef.current.querySelectorAll(
      ".chat-messages__item-wrapper"
    );

    if (visibleElements.length > 0) {
      const samples = heightSamplesRef.current;

      // 收集新样本
      for (let i = 0; i < Math.min(visibleElements.length, 5); i++) {
        const height = (visibleElements[i] as HTMLElement).offsetHeight;
        if (height > 20 && height < 1000) {
          samples.push(height);
        }
      }

      // 保持样本池大小
      if (samples.length > 20) {
        samples.splice(0, samples.length - 20);
      }

      // 计算加权平均高度
      if (samples.length > 0) {
        const avgHeight =
          samples.reduce((sum, h) => sum + h, 0) / samples.length;
        avgHeightRef.current = avgHeight;
      }
    }
  }, [containerRef, messageCount]);

  // 可见消息列表 - 使用 useMemo 优化
  const visibleMessages = useMemo(() => {
    if (!shouldUseLazyLoading) return messages;
    const safeEnd = Math.min(visibleRange.end, messageCount);
    const safeStart = Math.max(0, visibleRange.start);
    return messages.slice(safeStart, safeEnd);
  }, [messages, visibleRange, shouldUseLazyLoading, messageCount]);

  // 优化的可见范围更新
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

    // 减少更新频率：只有显著变化才更新
    const rangeChangeThreshold = 3;
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
        updateAvgHeight();
      }, RANGE_UPDATE_DEBOUNCE);
    }
  }, [containerRef, messageCount, shouldUseLazyLoading, updateAvgHeight]);

  // 优化占位符渲染
  const renderPlaceholders = useCallback(() => {
    if (!shouldUseLazyLoading) return null;

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
  }, [shouldUseLazyLoading, visibleRange, messageCount]);

  // ResizeObserver 优化
  useEffect(() => {
    if (!shouldUseLazyLoading || !containerRef.current) return;

    if (typeof ResizeObserver !== "undefined") {
      observerRef.current = new ResizeObserver((entries) => {
        // 限制 ResizeObserver 触发频率
        if (
          Date.now() - lastHeightUpdateTimeRef.current >
          HEIGHT_UPDATE_INTERVAL
        ) {
          updateAvgHeight();
        }
      });

      observerRef.current.observe(containerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [shouldUseLazyLoading, updateAvgHeight, containerRef]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  // 初始化高度计算
  useEffect(() => {
    if (shouldUseLazyLoading && messageCount > 0) {
      // 延迟执行，避免阻塞初始渲染
      const timer = setTimeout(() => updateAvgHeight(), 100);
      return () => clearTimeout(timer);
    }
  }, [shouldUseLazyLoading, messageCount, updateAvgHeight]);

  return {
    visibleMessages,
    renderPlaceholders,
    updateVisibleRange,
    visibleRange,
  };
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

  // --- Load Older Messages Handler (优化：添加防重复调用)
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
        "MessagesList: Cannot load older messages, invalid beforeKey.",
        oldestMessage
      );
      return;
    }

    console.log(
      `MessagesList: Loading older messages before key: ${beforeKey}`
    );

    if (containerRef.current) {
      scrollHeightBeforeLoadingOlderRef.current =
        containerRef.current.scrollHeight;
    }

    dispatch(loadOlderMessages({ dialogId, beforeKey }));
  }, [dispatch, dialogId, displayMessages, hasMoreOlder, isLoadingOlder]);

  // --- Virtual List Hook ---
  const {
    visibleMessages,
    renderPlaceholders,
    updateVisibleRange,
    visibleRange,
  } = useVirtualList(containerRef, displayMessages, shouldUseLazyLoading);

  // --- Scroll Handling Hook ---
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

    // 恢复滚动位置（加载旧消息后）
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
          `MessagesList: Restored scroll position by ${scrollHeightDiff}px`
        );
      }
      scrollHeightBeforeLoadingOlderRef.current = 0;
    }

    // 自动滚动到底部
    const newMessagesAppended =
      messagesAddedCount > 0 && currentMessageCount > prevMessageCount;
    if (
      autoScroll &&
      (prevMessageCount === 0 ||
        newMessagesAppended ||
        (!isLoadingInitial && currentMessageCount > 0))
    ) {
      const instant = prevMessageCount === 0 || messagesAddedCount > 1;
      // 使用 requestAnimationFrame 优化滚动性能
      requestAnimationFrame(() => scrollToBottom(instant));
      console.log(
        `MessagesList: Auto-scrolled to bottom (instant: ${instant})`
      );
    }

    prevDisplayMessagesLengthRef.current = currentMessageCount;
  }, [displayMessages, autoScroll, scrollToBottom, isLoadingInitial]);

  // 滚动到底部按钮处理
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
          padding: 24px 0;
          scroll-behavior: auto;
          overscroll-behavior: contain;
          z-index: 1;
          scrollbar-width: thin;
          scrollbar-color: ${theme.border || "#ccc"} transparent;
          contain: layout style paint;
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
          will-change: transform, opacity;
          contain: layout style paint;
        }

        .chat-messages__placeholder--top,
        .chat-messages__placeholder--bottom {
          flex-shrink: 0;
        }

        /* 响应式布局优化 */
        @media (min-width: 1200px) {
          .chat-messages__list {
            padding: 24px 5%;
          }
        }

        @media (max-width: 1024px) {
          .chat-messages__list {
            padding: 20px 2%;
          }
        }

        @media (max-width: 768px) {
          .chat-messages__list {
            padding: 16px 8px;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .chat-messages__list {
            padding: 12px 4px;
            gap: 10px;
          }
        }

        @media (max-width: 360px) {
          .chat-messages__list {
            padding: 8px 2px;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

// Memoize MessageItem for performance optimization
const MemoizedMessageItem = memo(MessageItem);

export default MessagesList;
