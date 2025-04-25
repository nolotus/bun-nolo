// src/chat/messages/MessagesList.jsx
import { useAppSelector } from "app/hooks";
import type React from "react";
import { useCallback, useEffect, useRef, useState, memo, useMemo } from "react";
import { MessageItem } from "./MessageItem";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import {
  selectMergedMessages,
  selectStreamMessages,
} from "chat/messages/messageSlice";
import { useTheme } from "app/theme";

const MemoizedMessageItem = memo(MessageItem);

// --- Constants ---
const LAZY_LOAD_THRESHOLD = 100; // 启用懒加载的消息数量阈值
const SCROLL_NEAR_BOTTOM_THRESHOLD = 150; // 距离底部多少像素视为“接近底部”
const SCROLL_DEBOUNCE_MS = 150; // 滚动停止后重置用户滚动标记的延迟
const USER_ACTION_RESET_MS = 100; // 程序化滚动后重置用户滚动标记的延迟
const AVG_MESSAGE_HEIGHT_ESTIMATE = 100; // 懒加载时消息平均高度的估算值
const LAZY_LOAD_BUFFER_SCREENS = 1; // 懒加载时预加载视口上方/下方的屏幕数量

const MessagesList: React.FC = () => {
  const theme = useTheme();
  const messages = useAppSelector(selectMergedMessages);
  const streamingMessages = useAppSelector(selectStreamMessages);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true); // 是否自动滚动到底部

  // --- Refs for state management without re-renders ---
  const lastScrollHeightRef = useRef(0); // 用于检测内容高度变化
  const lastMessageCountRef = useRef(messages.length); // 用于检测消息数量变化
  const scrollDebounceTimerRef = useRef<number | null>(null); // handleScroll 的防抖定时器
  const userScrollActionRef = useRef(false); // 标记是否由用户手动滚动或程序化滚动引起，用于调整 autoScroll 行为
  const lastScrollTopRef = useRef(0); // 记录上次滚动位置，用于判断滚动方向

  // --- Lazy Loading ---
  const messageCount = messages.length;
  const shouldUseLazyLoading = useMemo(
    () => messageCount > LAZY_LOAD_THRESHOLD,
    [messageCount]
  );

  const estimatedAvgHeight = useMemo(() => {
    if (!containerRef.current || messageCount === 0) {
      return AVG_MESSAGE_HEIGHT_ESTIMATE;
    }
    const calculatedAvg = containerRef.current.scrollHeight / messageCount;
    return calculatedAvg > 20 ? calculatedAvg : AVG_MESSAGE_HEIGHT_ESTIMATE; // 使用计算值或回退值
  }, [messageCount, containerRef.current?.scrollHeight]);

  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 }); // 可见消息的索引范围

  // 计算实际在 DOM 中渲染的消息
  const visibleMessages = useMemo(() => {
    if (!shouldUseLazyLoading) return messages;
    const endIndex = Math.min(visibleRange.end, messageCount);
    return messages.slice(visibleRange.start, endIndex);
  }, [messages, visibleRange, shouldUseLazyLoading, messageCount]);

  // --- Scrolling Logic ---

  // 检查滚动条是否接近底部
  const isNearBottom = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      return (
        scrollHeight <= clientHeight ||
        scrollHeight - scrollTop - clientHeight < SCROLL_NEAR_BOTTOM_THRESHOLD
      );
    }
    return true;
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback(
    (instant = false) => {
      if (containerRef.current) {
        userScrollActionRef.current = true; // 标记为程序化滚动，防止 handleScroll 干扰
        const scrollHeight = containerRef.current.scrollHeight;
        containerRef.current.scrollTo({
          top: scrollHeight,
          behavior: instant ? "auto" : "smooth",
        });

        // 短暂延迟后重置标记，并确保 autoScroll 为 true
        const timer = window.setTimeout(() => {
          userScrollActionRef.current = false;
          if (!autoScroll) {
            setAutoScroll(true);
          }
        }, USER_ACTION_RESET_MS);
        // 虽然此 timeout 通常会执行，但在组件卸载时清除是好习惯（如果需要）
        // 如果 scrollToBottom 可能在卸载前调用，需要 useRef 来存 timer id
      }
    },
    [autoScroll]
  ); // 依赖 autoScroll 是因为 setTimeout 中读取并设置了它

  // 处理滚动事件：更新 autoScroll 状态和懒加载范围
  const handleScroll = useCallback(() => {
    if (!containerRef.current || userScrollActionRef.current) return; // 忽略程序化滚动或无容器

    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    // 滚动防抖：清除旧计时器，设置新计时器以在滚动停止后重置 userScrollActionRef
    if (scrollDebounceTimerRef.current) {
      window.clearTimeout(scrollDebounceTimerRef.current);
    }
    scrollDebounceTimerRef.current = window.setTimeout(() => {
      userScrollActionRef.current = false;
    }, SCROLL_DEBOUNCE_MS);

    // 判断滚动方向
    const scrollingDown = scrollTop > lastScrollTopRef.current;
    lastScrollTopRef.current = Math.max(0, scrollTop);

    // 更新 autoScroll 状态
    const nearBottom = isNearBottom();
    if (!nearBottom && autoScroll) {
      // 用户向上滚动离开底部，禁用 autoScroll
      setAutoScroll(false);
      userScrollActionRef.current = true; // 标记为用户操作，避免因流更新等意外重置 autoScroll
    } else if (nearBottom && !autoScroll && scrollingDown) {
      // 用户向下滚动回到接近底部区域，重新启用 autoScroll
      setAutoScroll(true);
    }

    // 更新懒加载的可见范围
    if (shouldUseLazyLoading) {
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
  ]); // 依赖项包括所有用于计算的状态和值

  // 当视口上方添加内容时，保持当前视口内容的滚动位置
  const preserveScrollPosition = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const currentScrollHeight = container.scrollHeight;
    const scrollHeightDiff = currentScrollHeight - lastScrollHeightRef.current;

    if (scrollHeightDiff > 0 && !autoScroll) {
      // 如果内容高度增加且未启用自动滚动，向上调整滚动位置以保持视图稳定
      container.scrollTop += scrollHeightDiff;
    }
    // 更新最后记录的高度（无论是否调整）
    lastScrollHeightRef.current = currentScrollHeight;
  }, [autoScroll]); // 依赖 autoScroll

  // --- Effects ---

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    lastScrollHeightRef.current = container.scrollHeight; // 记录初始高度
    lastScrollTopRef.current = container.scrollTop; // 记录初始位置

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollDebounceTimerRef.current) {
        // 清理防抖计时器
        window.clearTimeout(scrollDebounceTimerRef.current);
      }
    };
  }, [handleScroll]); // 当 handleScroll 回调变化时重新绑定

  // 处理消息列表变化时的滚动行为
  useEffect(() => {
    if (!containerRef.current) return;
    userScrollActionRef.current = true; // 标记，避免 effect 内操作触发 handleScroll

    const messageCountChanged = messageCount !== lastMessageCountRef.current;

    // 1. 保持滚动位置（处理列表上方可能增加内容的情况）
    preserveScrollPosition();

    // 2. 判断是否需要滚动到底部
    const wasInitiallyEmpty =
      lastMessageCountRef.current === 0 && messageCount > 0;
    const newMessagesAdded = messageCount > lastMessageCountRef.current; // 修正了拼写错误

    if (wasInitiallyEmpty || (newMessagesAdded && autoScroll)) {
      // 初始加载或有新消息且自动滚动开启时，滚动到底部
      scrollToBottom(wasInitiallyEmpty); // 初始加载瞬间滚动，新消息平滑滚动
    }

    lastMessageCountRef.current = messageCount; // 更新消息数量记录

    // 延迟重置标记
    const timer = window.setTimeout(() => {
      userScrollActionRef.current = false;
    }, USER_ACTION_RESET_MS);
    return () => clearTimeout(timer); // 清理 timeout
  }, [messageCount, autoScroll, preserveScrollPosition, scrollToBottom]); // 依赖项

  // 处理流式消息进行中的滚动
  useEffect(() => {
    // 当有流式消息且自动滚动开启时，滚动到底部
    if (streamingMessages.length > 0 && autoScroll) {
      scrollToBottom(false); // 平滑滚动
    }
  }, [streamingMessages.length, autoScroll, scrollToBottom]); // 依赖项

  // "滚动到底部"按钮点击处理
  const handleScrollToBottomClick = useCallback(() => {
    scrollToBottom(false); // 平滑滚动
    // setAutoScroll(true); // scrollToBottom 内部会处理 autoScroll 的重置
  }, [scrollToBottom]);

  // --- Rendering ---

  // 渲染懒加载占位符
  const renderPlaceholders = () => {
    if (!shouldUseLazyLoading) return null;
    const topPlaceholderHeight = visibleRange.start * estimatedAvgHeight;
    const bottomPlaceholderHeight =
      Math.max(0, messageCount - visibleRange.end) * estimatedAvgHeight; // 确保不为负

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

  return (
    <>
      <div className="chat-messages-container">
        <div
          ref={containerRef}
          className="chat-message-list"
          role="log"
          aria-live="polite"
        >
          {renderPlaceholders()}
          {visibleMessages.map((message, index) => {
            const key = message.id || `msg-${visibleRange.start + index}`; // 优先使用 message.id
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

        <ScrollToBottomButton
          isVisible={!autoScroll && !!containerRef.current} // 仅当手动滚动离开底部时显示
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
          scroll-behavior: smooth; // 主要由 JS 控制，CSS 属性提供基础
          -webkit-overflow-scrolling: touch;
          background-color: ${theme.background};
          overscroll-behavior: contain;
          z-index: 1;
        }
        /* Scrollbar Styles */
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
          min-height: 1px; /* Ensure takes space */
          flex-shrink: 0;
          background: transparent;
        }
        @keyframes chatMessageAppear {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* Responsive */
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
