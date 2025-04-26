// chat/messages/MessagesList
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
import { useAppSelector, useAppDispatch } from "app/hooks";
import {
  selectMergedMessages,
  selectMessagesState,
  loadOlderMessages,
} from "chat/messages/messageSlice";

// --- 顶部加载指示器组件 ---
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

// --- 常量定义 ---
const LAZY_LOAD_THRESHOLD = 100; // 懒加载阈值，消息数量超过此值时启用懒加载
const SCROLL_NEAR_BOTTOM_THRESHOLD = 150; // 接近底部的滚动阈值（像素）
const SCROLL_DEBOUNCE_MS = 150; // 滚动事件去抖时间（毫秒）
const USER_ACTION_RESET_MS = 100; // 用户操作重置时间（毫秒）
const AVG_MESSAGE_HEIGHT_ESTIMATE = 100; // 平均消息高度估计值（像素）
const LAZY_LOAD_BUFFER_SCREENS = 1; // 懒加载缓冲屏幕数
const TOP_SCROLL_THRESHOLD = 50; // 触发加载旧消息的顶部滚动阈值（像素）
const OLDER_LOAD_LIMIT = 30; // 向上滚动加载的消息数量

// --- 组件属性接口 ---
interface MessagesListProps {
  dialogId: string; // 对话ID
}

// --- MessagesList 组件 ---
const MessagesList: React.FC<MessagesListProps> = ({ dialogId }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // --- 从 Redux 获取合并后的消息和状态 ---
  const displayMessages = useAppSelector(selectMergedMessages); // 获取合并后的消息列表
  const { isLoadingOlder, hasMoreOlder } = useAppSelector(selectMessagesState);

  // --- 状态和引用管理 ---
  const containerRef = useRef<HTMLDivElement | null>(null); // 消息容器引用
  const [autoScroll, setAutoScroll] = useState(true); // 是否自动滚动到底部
  const lastScrollHeightRef = useRef(0); // 上一次滚动高度
  const scrollDebounceTimerRef = useRef<number | null>(null); // 滚动事件去抖定时器
  const userScrollActionRef = useRef(false); // 是否为用户滚动操作
  const lastScrollTopRef = useRef(0); // 上一次滚动顶部位置
  const scrollHeightBeforeLoadingOlderRef = useRef(0); // 加载旧消息前的高度
  const prevDisplayMessagesLengthRef = useRef(0); // 跟踪消息长度变化

  // --- 虚拟化逻辑（基于最终的 displayMessages） ---
  const messageCount = displayMessages.length; // 消息总数
  const shouldUseLazyLoading = useMemo(
    () => messageCount > LAZY_LOAD_THRESHOLD,
    [messageCount]
  ); // 是否使用懒加载
  const estimatedAvgHeight = useMemo(() => {
    if (!containerRef.current || messageCount === 0)
      return AVG_MESSAGE_HEIGHT_ESTIMATE;
    const calculatedAvg = containerRef.current.scrollHeight / messageCount;
    return calculatedAvg > 20 ? calculatedAvg : AVG_MESSAGE_HEIGHT_ESTIMATE;
  }, [messageCount, containerRef.current?.scrollHeight]); // 估计平均消息高度
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 }); // 可见消息范围
  const visibleMessages = useMemo(() => {
    if (!shouldUseLazyLoading) return displayMessages;
    const endIndex = Math.min(visibleRange.end, messageCount);
    return displayMessages.slice(visibleRange.start, endIndex);
  }, [displayMessages, visibleRange, shouldUseLazyLoading, messageCount]); // 可见消息列表

  // --- 滚动相关逻辑 ---
  // 检查是否接近底部
  const isNearBottom = useCallback(() => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return (
      scrollHeight <= clientHeight ||
      scrollHeight - scrollTop - clientHeight < SCROLL_NEAR_BOTTOM_THRESHOLD
    );
  }, []);

  // 滚动到底部
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
    },
    [autoScroll]
  );

  // --- 加载旧消息逻辑 ---
  const handleLoadOlderMessages = useCallback(() => {
    if (displayMessages.length === 0 || !hasMoreOlder || isLoadingOlder) return;

    // 获取最早的消息 key 作为 beforeKey
    const oldestMessage = displayMessages[0];
    const beforeKey = oldestMessage?._key || oldestMessage?.id;

    if (!beforeKey || beforeKey.startsWith("remote-")) {
      console.warn(
        "handleLoadOlderMessages: 无法加载旧消息，无效的旧消息 key:",
        beforeKey
      );
      return;
    }

    console.log(
      `handleLoadOlderMessages: 加载旧消息，beforeKey 为 ${beforeKey}`
    );
    dispatch(
      loadOlderMessages({ dialogId, beforeKey, limit: OLDER_LOAD_LIMIT })
    );
  }, [dialogId, displayMessages, hasMoreOlder, isLoadingOlder, dispatch]);

  // --- 处理滚动事件 ---
  const handleScroll = useCallback(() => {
    if (!containerRef.current || userScrollActionRef.current) return;
    const { scrollTop } = containerRef.current;

    // 去抖处理
    if (scrollDebounceTimerRef.current)
      clearTimeout(scrollDebounceTimerRef.current);
    scrollDebounceTimerRef.current = setTimeout(() => {
      userScrollActionRef.current = false;
    }, SCROLL_DEBOUNCE_MS);

    // 触发加载旧消息
    if (scrollTop < TOP_SCROLL_THRESHOLD && !isLoadingOlder && hasMoreOlder) {
      scrollHeightBeforeLoadingOlderRef.current =
        containerRef.current.scrollHeight; // 记录加载前的滚动高度
      handleLoadOlderMessages();
    }

    // 更新自动滚动状态
    const scrollingDown = scrollTop > lastScrollTopRef.current;
    lastScrollTopRef.current = Math.max(0, scrollTop);
    const nearBottom = isNearBottom();
    if (!nearBottom && autoScroll) setAutoScroll(false);
    else if (nearBottom && !autoScroll && scrollingDown) setAutoScroll(true);

    // 更新懒加载范围
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
    handleLoadOlderMessages,
  ]);

  // --- 副作用处理 ---

  // 绑定滚动事件监听器
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

  // 处理消息列表变化（滚动位置和自动滚动）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const currentMessageCount = displayMessages.length;
    const prevMessageCount = prevDisplayMessagesLengthRef.current;
    const messagesAddedCount = currentMessageCount - prevMessageCount;

    const currentScrollHeight = container.scrollHeight;
    const scrollHeightDiff = currentScrollHeight - lastScrollHeightRef.current;

    // --- 1. 在前置添加消息时保持滚动位置 ---
    // 如果加载旧消息导致高度显著增加，调整滚动位置
    if (scrollHeightBeforeLoadingOlderRef.current > 0 && scrollHeightDiff > 0) {
      const adjustment =
        currentScrollHeight - scrollHeightBeforeLoadingOlderRef.current;
      if (adjustment > 5 && !autoScroll) {
        container.scrollTop += adjustment;
        console.log(`MessagesList: 前置添加消息后调整滚动位置 ${adjustment}px`);
      }
      scrollHeightBeforeLoadingOlderRef.current = 0; // 重置引用
    }

    // --- 2. 追加消息时自动滚动 ---
    userScrollActionRef.current = true; // 防止 handleScroll 干扰
    const wasInitiallyEmpty = prevMessageCount === 0 && currentMessageCount > 0;
    const newMessagesAppended = messagesAddedCount > 0 && autoScroll;
    if (wasInitiallyEmpty || newMessagesAppended) {
      scrollToBottom(wasInitiallyEmpty || messagesAddedCount > 1); // 初始或多条消息时立即滚动
    }

    // --- 3. 更新引用 ---
    prevDisplayMessagesLengthRef.current = currentMessageCount;
    lastScrollHeightRef.current = currentScrollHeight;
    const timer = setTimeout(() => {
      userScrollActionRef.current = false;
    }, USER_ACTION_RESET_MS);
    return () => clearTimeout(timer);
  }, [displayMessages, autoScroll, scrollToBottom]);

  // 滚动到底部按钮点击事件
  const handleScrollToBottomClick = useCallback(
    () => scrollToBottom(false),
    [scrollToBottom]
  );

  // 渲染虚拟化占位符
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

  // --- 渲染组件 ---
  return (
    <>
      <style>{spinKeyframes}</style> {/* 确保旋转动画可用 */}
      <div className="chat-messages-container">
        <div
          ref={containerRef}
          className="chat-message-list"
          role="log"
          aria-live="polite"
        >
          {/* 顶部加载指示器 */}
          {isLoadingOlder && <TopLoadingIndicator />}

          {/* 占位符和消息列表 */}
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

        {/* 滚动到底部按钮 */}
        <ScrollToBottomButton
          isVisible={!autoScroll && !!containerRef.current}
          onClick={handleScrollToBottomClick}
        />
      </div>
      {/* 样式定义 */}
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
          scroll-behavior: auto; /* 让 JS 控制平滑滚动 */
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

// --- 导出 MemoizedMessageItem 和 MessagesList ---
const MemoizedMessageItem = memo(MessageItem);
export default MessagesList;
