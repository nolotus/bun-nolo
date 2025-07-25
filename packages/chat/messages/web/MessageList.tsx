// /chat/messages/web/MessageList.tsx (完整修复版)

import React, {
  useRef,
  useLayoutEffect,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useTheme } from "app/theme";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectAllMsgs,
  selectMessagesLoadingState,
  loadOlderMessages,
  selectLastStreamTimestamp,
} from "chat/messages/messageSlice";
import MessageItem from "./MessageItem";
import TopLoadingIndicator from "./TopLoadingIndicator";
import { ScrollToBottomButton } from "chat/web/ScrollToBottomButton";

const LOAD_THRESHOLD = 50;

interface MessagesListProps {
  dialogId: string;
}

const MessagesList: React.FC<MessagesListProps> = ({ dialogId }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const listRef = useRef<HTMLDivElement>(null);

  const messages = useAppSelector(selectAllMsgs);
  const { isLoadingOlder, hasMoreOlder } = useAppSelector(
    selectMessagesLoadingState
  );
  const lastStreamTimestamp = useAppSelector(selectLastStreamTimestamp);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const stateRef = useRef({
    isInitialLoad: true,
    prevMessagesLength: 0,
    isLoadingOlder: false,
    hasMoreOlder: true,
    scrollContainer: null as HTMLDivElement | null,
    isNearBottom: true, // [新增] 跟踪用户是否在底部
  });
  stateRef.current.isLoadingOlder = isLoadingOlder;
  stateRef.current.hasMoreOlder = hasMoreOlder;

  // [核心修复] 优化滚动逻辑
  useLayoutEffect(() => {
    const scroller = listRef.current?.closest(
      ".MainLayout__pageContent"
    ) as HTMLDivElement;
    if (!scroller) return;

    // 初次加载，直接滚动到底部
    if (stateRef.current.isInitialLoad && messages.length > 0) {
      scroller.scrollTop = scroller.scrollHeight;
      stateRef.current.isInitialLoad = false;
      return;
    }

    // 当有新消息时 (通过比较消息长度)
    if (messages.length > stateRef.current.prevMessagesLength) {
      // 只有当用户已经在底部区域时，才自动滚动
      if (stateRef.current.isNearBottom) {
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
      }
    }

    stateRef.current.prevMessagesLength = messages.length;
  }, [messages, lastStreamTimestamp]);

  const handleLoadOlder = useCallback(() => {
    if (
      stateRef.current.isLoadingOlder ||
      !stateRef.current.hasMoreOlder ||
      messages.length === 0
    )
      return;

    const scroller = listRef.current?.closest(
      ".MainLayout__pageContent"
    ) as HTMLDivElement;
    if (scroller) {
      const prevScrollHeight = scroller.scrollHeight;
      const prevScrollTop = scroller.scrollTop;

      const oldestMessage = messages[0];
      const beforeKey = (oldestMessage as any).dbKey ?? oldestMessage.id;

      if (beforeKey) {
        dispatch(loadOlderMessages({ dialogId, beforeKey })).then(() => {
          const currentScroller = listRef.current?.closest(
            ".MainLayout__pageContent"
          ) as HTMLDivElement;
          if (currentScroller) {
            currentScroller.scrollTop =
              prevScrollTop + (currentScroller.scrollHeight - prevScrollHeight);
          }
        });
      }
    }
  }, [dispatch, messages, dialogId]);

  const handleScroll = useCallback(() => {
    const scroller = stateRef.current.scrollContainer;
    if (!scroller) return;

    // 检查是否滚动到顶部以加载更多
    if (scroller.scrollTop < LOAD_THRESHOLD) {
      handleLoadOlder();
    }

    // [核心修复] 更新 isNearBottom 状态，并放宽按钮显示阈值
    const isAtBottomNow =
      scroller.scrollHeight - scroller.clientHeight <= scroller.scrollTop + 150;
    stateRef.current.isNearBottom = isAtBottomNow;

    const shouldShowButton =
      scroller.scrollHeight - scroller.clientHeight > scroller.scrollTop + 10;
    setShowScrollToBottom(shouldShowButton);
  }, [handleLoadOlder]);

  useEffect(() => {
    const scroller = listRef.current?.closest(
      ".MainLayout__pageContent"
    ) as HTMLDivElement;
    if (scroller) {
      stateRef.current.scrollContainer = scroller;
      scroller.addEventListener("scroll", handleScroll, { passive: true });
      return () => scroller.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const scrollToBottom = useCallback(() => {
    stateRef.current.scrollContainer?.scrollTo({
      top: stateRef.current.scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const css = `
    .chat-messages__list-wrapper {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      width: 100%;
    }
    .chat-messages__list {
      width: 100%;
      margin: 0 auto;
      padding: var(--space-4) var(--space-3);
      gap: var(--space-2);
    }
    
    /* Tablet & Portrait iPads */
    @media (min-width: 768px) {
      .chat-messages__list {
        padding: var(--space-5) var(--space-8);
        gap: var(--space-3);
      }
    }

    /* Small Laptops & Landscape iPads */
    @media (min-width: 1024px) {
      .chat-messages__list {
        padding: var(--space-6) var(--space-12);
        gap: var(--space-4);
      }
    }

    /* [核心修复] 优化大屏幕和超大屏的宽度，使其更舒适 */
    @media (min-width: 1440px) {
      .chat-messages__list {
        max-width: 1080px;
      }
    }
    @media (min-width: 1600px) {
      .chat-messages__list {
        max-width: 1280px;
      }
    }
    
    .chat-messages__item-wrapper {
      opacity: 0;
      transform: translateY(15px);
      animation: chat-messages__message-appear 0.3s ease-out forwards;
      will-change: transform, opacity;
    }
    .top-loading {
      animation: slide-down 0.3s ease-out;
    }
    @keyframes chat-messages__message-appear {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slide-down {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .chat-messages__item-wrapper, .top-loading {
        animation-duration: 0.01ms !important;
      }
    }
  `;

  return (
    <div className="chat-messages__list-wrapper" ref={listRef}>
      <div className="chat-messages__list" role="log" aria-live="polite">
        {isLoadingOlder && (
          <div className="top-loading">
            <TopLoadingIndicator />
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className="chat-messages__item-wrapper"
            style={{ animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}
          >
            <MessageItem message={msg} />
          </div>
        ))}
      </div>
      <ScrollToBottomButton
        isVisible={showScrollToBottom}
        onClick={scrollToBottom}
      />
      <style href="chat-messages-list-styles" precedence="component">
        {css}
      </style>
    </div>
  );
};

export default MessagesList;
