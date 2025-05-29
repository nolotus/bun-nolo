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

// --- 常量 ---
const LAZY_LOAD_THRESHOLD = 30;
const SCROLL_NEAR_BOTTOM_THRESHOLD = 150;
const SCROLL_DEBOUNCE_MS = 150;
const USER_ACTION_RESET_MS = 100;
const AVG_MESSAGE_HEIGHT_ESTIMATE = 100;
const LAZY_LOAD_BUFFER_SCREENS = 2;
const TOP_SCROLL_THRESHOLD = 50;

// --- 滚动处理 Hook ---
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

    // 拉取更早消息
    if (scrollTop < TOP_SCROLL_THRESHOLD && !isLoadingOlder && hasMoreOlder) {
      handleLoadOlderMessages();
    }

    // 自动滚到底部开关
    const nearBottom = isNearBottom();
    if (!nearBottom && autoScroll) {
      setAutoScroll(false);
    } else if (nearBottom && !autoScroll) {
      setAutoScroll(true);
    }

    // 更新可见范围
    if (shouldUseLazyLoading) {
      updateVisibleRange();
    }

    // 重置用户滚动标志
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
    updateVisibleRange,
    shouldUseLazyLoading,
    containerRef,
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

// --- 虚拟化 & 懒加载 Hook ---
const useVirtualList = (
  containerRef: React.RefObject<HTMLDivElement>,
  messages: Message[],
  shouldUseLazyLoading: boolean
) => {
  const messageCount = messages.length;
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: shouldUseLazyLoading ? Math.min(messageCount, 50) : messageCount,
  });

  const avgHeightRef = useRef<number>(AVG_MESSAGE_HEIGHT_ESTIMATE);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRangeRef = useRef(visibleRange);
  const lastHeightUpdateTimeRef = useRef<number>(0);

  const HEIGHT_UPDATE_INTERVAL = 1000;
  const MIN_HEIGHT = 50;
  const MAX_HEIGHT = 500;

  // 计算平均高度
  const updateAvgHeight = useCallback(() => {
    const now = Date.now();
    if (now - lastHeightUpdateTimeRef.current < HEIGHT_UPDATE_INTERVAL) {
      return;
    }
    lastHeightUpdateTimeRef.current = now;

    if (!containerRef.current || messageCount === 0) return;
    const visibleEls = containerRef.current.querySelectorAll(
      ".chat-messages__item-wrapper"
    );
    if (visibleEls.length === 0) return;

    let total = 0;
    let count = 0;
    const maxCheck = Math.min(visibleEls.length, 5);
    for (let i = 0; i < maxCheck; i++) {
      const h = (visibleEls[i] as HTMLElement).offsetHeight;
      if (h > 0) {
        total += h;
        count++;
      }
    }
    if (count > 0) {
      const avg = total / count;
      if (avg >= MIN_HEIGHT && avg <= MAX_HEIGHT) {
        avgHeightRef.current = avg;
      }
    }
  }, [containerRef, messageCount]);

  // ResizeObserver：图片、字体加载完毕后重新计算
  useEffect(() => {
    if (!shouldUseLazyLoading || !containerRef.current) return;
    let observer: ResizeObserver | null = null;
    let lastResizeTime = 0;
    const THROTTLE_MS = 200;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        const now = Date.now();
        if (now - lastResizeTime > THROTTLE_MS) {
          updateAvgHeight();
          lastResizeTime = now;
        }
      });
      observer.observe(containerRef.current);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [shouldUseLazyLoading, updateAvgHeight, containerRef]);

  // 更新可见范围
  const updateVisibleRange = useCallback(() => {
    const elem = containerRef.current;
    if (!elem || !shouldUseLazyLoading) return;
    const { scrollTop, clientHeight } = elem;
    const avgH = avgHeightRef.current;
    const visibleCount = Math.ceil(clientHeight / avgH);
    const buffer = Math.ceil(visibleCount * LAZY_LOAD_BUFFER_SCREENS);
    const firstIdx = Math.max(0, Math.floor(scrollTop / avgH));
    const newStart = Math.max(0, firstIdx - buffer);
    const newEnd = Math.min(messageCount, firstIdx + visibleCount + buffer);

    const THRESHOLD = 5;
    if (
      Math.abs(newStart - lastRangeRef.current.start) > THRESHOLD ||
      Math.abs(newEnd - lastRangeRef.current.end) > THRESHOLD
    ) {
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
      updateTimerRef.current = setTimeout(() => {
        setVisibleRange({ start: newStart, end: newEnd });
        lastRangeRef.current = { start: newStart, end: newEnd };
        updateAvgHeight();
      }, 100);
    }
  }, [containerRef, messageCount, shouldUseLazyLoading, updateAvgHeight]);

  // 首次挂载 & 消息长度变化时触发一次
  useEffect(() => {
    if (shouldUseLazyLoading) {
      updateVisibleRange();
    } else {
      setVisibleRange({ start: 0, end: messageCount });
    }
  }, [messageCount, shouldUseLazyLoading, updateVisibleRange]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    };
  }, []);

  // 初始化时计算一次平均高度
  useEffect(() => {
    if (shouldUseLazyLoading && messageCount > 0) {
      updateAvgHeight();
    }
  }, [shouldUseLazyLoading, messageCount, updateAvgHeight]);

  // 可见消息列表
  const visibleMessages = useMemo(() => {
    if (!shouldUseLazyLoading) return messages;
    const start = Math.max(0, visibleRange.start);
    const end = Math.min(messageCount, visibleRange.end);
    return messages.slice(start, end);
  }, [messages, visibleRange, shouldUseLazyLoading, messageCount]);

  // 渲染占位符
  const renderPlaceholders = useCallback(() => {
    if (!shouldUseLazyLoading) return null;
    const avgH = avgHeightRef.current;
    const topH = visibleRange.start * avgH;
    const bottomCount = Math.max(0, messageCount - visibleRange.end);
    const bottomH = bottomCount * avgH;
    return (
      <>
        {topH > 0 && (
          <div
            className="chat-messages__placeholder--top"
            style={{ height: `${topH}px` }}
            aria-hidden="true"
          />
        )}
        {bottomH > 0 && (
          <div
            className="chat-messages__placeholder--bottom"
            style={{ height: `${bottomH}px` }}
            aria-hidden="true"
          />
        )}
      </>
    );
  }, [shouldUseLazyLoading, visibleRange, messageCount]);

  return {
    visibleMessages,
    visibleRange,
    renderPlaceholders,
    updateVisibleRange,
  };
};

// --- MessagesList 组件 ---
interface MessagesListProps {
  dialogId: string;
}

const MessagesList: React.FC<MessagesListProps> = ({ dialogId }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const displayMessages = useAppSelector(selectMergedMessages);
  const isLoadingInitial = useAppSelector(selectIsLoadingInitial);
  const isLoadingOlder = useAppSelector(selectIsLoadingOlder);
  const hasMoreOlder = useAppSelector(selectHasMoreOlder);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollHeightBeforeLoadingOlderRef = useRef(0);
  const prevDisplayMessagesLengthRef = useRef(displayMessages.length);

  const [autoScroll, setAutoScroll] = useState(true);

  const messageCount = displayMessages.length;
  const shouldUseLazyLoading = useMemo(
    () => messageCount > LAZY_LOAD_THRESHOLD,
    [messageCount]
  );

  // 加载更早消息
  const handleLoadOlderMessages = useCallback(() => {
    if (isLoadingOlder || !hasMoreOlder || displayMessages.length === 0) return;
    const oldest = displayMessages[0];
    const beforeKey =
      oldest?._key ?? (typeof oldest?.id === "string" ? oldest.id : null);
    if (
      !beforeKey ||
      (typeof beforeKey === "string" && beforeKey.startsWith("remote-"))
    ) {
      console.warn("无法加载更早消息，beforeKey 无效：", oldest);
      return;
    }
    if (containerRef.current) {
      scrollHeightBeforeLoadingOlderRef.current =
        containerRef.current.scrollHeight;
    }
    dispatch(loadOlderMessages({ dialogId, beforeKey }));
  }, [dispatch, dialogId, displayMessages, hasMoreOlder, isLoadingOlder]);

  // 虚拟化 Hook
  const {
    visibleMessages,
    visibleRange,
    renderPlaceholders,
    updateVisibleRange,
  } = useVirtualList(containerRef, displayMessages, shouldUseLazyLoading);

  // 滚动处理 Hook
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

  // 布局更新：自动滚动 & 恢复滚动位置
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const curLen = displayMessages.length;
    const prevLen = prevDisplayMessagesLengthRef.current;
    const added = curLen - prevLen;

    // 恢复加载更早消息前的位置
    if (scrollHeightBeforeLoadingOlderRef.current > 0 && added > 0) {
      const diff =
        container.scrollHeight - scrollHeightBeforeLoadingOlderRef.current;
      if (diff > 5 && !autoScroll) {
        container.scrollTop += diff;
      }
      scrollHeightBeforeLoadingOlderRef.current = 0;
    }

    // 自动滚到底部
    const appended = added > 0 && curLen > prevLen;
    if (
      autoScroll &&
      (prevLen === 0 || appended || (!isLoadingInitial && curLen > 0))
    ) {
      const instant = prevLen === 0 || added > 1;
      scrollToBottom(instant);
    }

    prevDisplayMessagesLengthRef.current = curLen;
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
        {visibleMessages.map((msg, idx) => {
          const realIndex = shouldUseLazyLoading
            ? visibleRange.start + idx
            : idx;
          const key = msg.id || `msg-fallback-${realIndex}`;
          const animationDelay = Math.min(idx * 0.03, 0.5);
          return (
            <div
              key={key}
              className="chat-messages__item-wrapper"
              style={{ animationDelay: `${animationDelay}s` }}
            >
              <MemoizedMessageItem message={msg} />
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
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chat-messages__container {
          display: flex; flex-direction: column; height: 100%;
          position: relative; overflow: hidden;
          background-color: ${theme.background || "#fff"};
        }
        .chat-messages__list {
          flex: 1 1 auto; overflow-y: auto; overflow-x: hidden;
          display: flex; flex-direction: column; gap: 16px;
          padding: 24px 15%; scroll-behavior: auto;
          overscroll-behavior: contain; z-index: 1;
          scrollbar-width: thin;
          scrollbar-color: ${theme.border || "#ccc"} transparent;
        }
        .chat-messages__list::-webkit-scrollbar { width: 8px; }
        .chat-messages__list::-webkit-scrollbar-track { background: transparent; }
        .chat-messages__list::-webkit-scrollbar-thumb {
          background-color: ${theme.border || "#ccc"};
          border-radius: 4px;
          border: 2px solid ${theme.background || "#fff"};
        }
        .chat-messages__list::-webkit-scrollbar-thumb:hover {
          background-color: ${theme.borderHover || "#aaa"};
        }
        .chat-messages__item-wrapper {
          opacity: 0; transform: translateY(15px);
          animation: chat-messages__message-appear 0.3s ease-out forwards;
          will-change: transform, opacity;
        }
        .chat-messages__placeholder--top,
        .chat-messages__placeholder--bottom {
          flex-shrink: 0;
        }
        @media (max-width: 1024px) {
          .chat-messages__list { padding: 20px 10%; }
        }
        @media (max-width: 768px) {
          .chat-messages__list { padding: 16px 12px; gap: 12px; }
        }
      `}</style>
    </div>
  );
};

const MemoizedMessageItem = memo(MessageItem);

export default MessagesList;
