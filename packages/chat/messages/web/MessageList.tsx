// /chat/messages/web/MessageList.tsx

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

  // 使用 Ref 来跟踪状态，避免 Effect 依赖过多
  const stateRef = useRef({
    isInitialLoad: true,
    prevMessagesLength: 0,
    isLoadingOlder: false,
    hasMoreOlder: true,
  });
  stateRef.current.isLoadingOlder = isLoadingOlder;
  stateRef.current.hasMoreOlder = hasMoreOlder;

  useLayoutEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const lastMessage = messages[messages.length - 1];

    // 【需求 3: 载入时滚动到最下】
    if (stateRef.current.isInitialLoad && messages.length > 0) {
      listEl.scrollTop = listEl.scrollHeight;
      stateRef.current.isInitialLoad = false;
      return;
    }

    // 【需求 1: 用户发送消息滚动最下】
    if (
      messages.length > stateRef.current.prevMessagesLength &&
      lastMessage?.role === "user"
    ) {
      listEl.scrollTo({ top: listEl.scrollHeight, behavior: "smooth" });
    }
    // 【需求 2 & 4: stream 跟随滚动 & 用户往上滚动时不要阻止】
    else {
      const isNearBottom =
        listEl.scrollHeight - listEl.clientHeight <= listEl.scrollTop + 150;

      if (isNearBottom) {
        listEl.scrollTo({ top: listEl.scrollHeight, behavior: "smooth" });
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

    if (listRef.current) {
      const prevScrollHeight = listRef.current.scrollHeight;
      const prevScrollTop = listRef.current.scrollTop;

      const oldestMessage = messages[0];
      const beforeKey = (oldestMessage as any).dbKey ?? oldestMessage.id;

      if (beforeKey) {
        dispatch(loadOlderMessages({ dialogId, beforeKey })).then(() => {
          if (listRef.current) {
            listRef.current.scrollTop =
              prevScrollTop + (listRef.current.scrollHeight - prevScrollHeight);
          }
        });
      }
    }
  }, [dispatch, messages, dialogId]);

  const handleScroll = useCallback(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    if (listEl.scrollTop < LOAD_THRESHOLD) {
      handleLoadOlder();
    }

    const atBottom =
      listEl.scrollHeight - listEl.clientHeight <= listEl.scrollTop + 1;
    setShowScrollToBottom(!atBottom);
  }, [handleLoadOlder]);

  useEffect(() => {
    const listEl = listRef.current;
    listEl?.addEventListener("scroll", handleScroll, { passive: true });
    return () => listEl?.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const css = `
    .chat-messages__container {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      overflow: hidden;
      background: var(--background);
    }
    .chat-messages__list {
      flex: 1 1 auto;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      width: 100%;
      
      /* Mobile First: 默认 (手机) */
      padding: var(--space-4) var(--space-3); /* 16px 12px */
      gap: var(--space-2); /* 8px */

      scroll-behavior: auto;
      overscroll-behavior: contain;
      z-index: 1;
      scrollbar-width: thin;
      scrollbar-color: var(--border) transparent;
    }
    .chat-messages__list::-webkit-scrollbar { width: 8px; }
    .chat-messages__list::-webkit-scrollbar-track { background: transparent; }
    .chat-messages__list::-webkit-scrollbar-thumb {
      background-color: var(--border);
      border-radius: 4px;
      border: 2px solid var(--background);
      transition: background-color 0.2s ease;
    }
    .chat-messages__list::-webkit-scrollbar-thumb:hover { background-color: var(--borderHover); }
    
    /* Tablet & Portrait iPads (7寸, 8寸平板) */
    @media (min-width: 768px) {
      .chat-messages__list {
        padding: var(--space-5) var(--space-8); /* 20px 32px */
        gap: var(--space-3); /* 12px */
      }
    }

    /* Small Laptops & Landscape iPads (13寸笔记本) */
    @media (min-width: 1024px) {
      .chat-messages__list {
        padding: var(--space-6) var(--space-12); /* 24px 48px */
        gap: var(--space-4); /* 16px */
      }
    }

    /* Large Laptops & Desktops (14, 16寸笔记本, 台式机) */
    @media (min-width: 1440px) {
      .chat-messages__list {
        padding-left: var(--space-16); /* 64px */
        padding-right: var(--space-16); /* 64px */
        margin-left: auto;
        margin-right: auto;
        max-width: 980px; /* 关键：限制内容最大宽度以保证可读性 */
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
    <div className="chat-messages__container">
      <div
        ref={listRef}
        className="chat-messages__list"
        role="log"
        aria-live="polite"
      >
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
