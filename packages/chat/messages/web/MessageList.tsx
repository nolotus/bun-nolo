import React, { useRef, useState, useEffect, useCallback } from "react";
import { useTheme } from "app/theme";
import { useAppSelector, useAppDispatch } from "app/hooks";
import {
  selectMergedMessages,
  selectIsLoadingOlder,
  selectHasMoreOlder,
  loadOlderMessages,
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

  const messages = useAppSelector(selectMergedMessages);
  const isLoadingOlder = useAppSelector(selectIsLoadingOlder);
  const hasMoreOlder = useAppSelector(selectHasMoreOlder);

  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [userScrolled, setUserScrolled] = useState(false);

  const handleLoadOlder = useCallback(() => {
    if (isLoadingOlder || !hasMoreOlder || messages.length === 0) return;
    const oldest = messages[0];
    const beforeKey = (oldest as any).dbKey ?? oldest.id;
    if (!beforeKey) return;

    const prevH = containerRef.current?.scrollHeight || 0;
    dispatch(loadOlderMessages({ dialogId, beforeKey })).finally(() => {
      const newH = containerRef.current?.scrollHeight || 0;
      if (containerRef.current) {
        containerRef.current.scrollTop = newH - prevH;
      }
    });
  }, [dispatch, dialogId, hasMoreOlder, isLoadingOlder, messages]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const c = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = c;

      if (scrollTop < LOAD_THRESHOLD) {
        handleLoadOlder();
      }

      const atBottom =
        scrollHeight - (scrollTop + clientHeight) < LOAD_THRESHOLD;

      if (e.isTrusted) {
        if (atBottom) {
          setAutoScroll(true);
          setUserScrolled(false);
        } else {
          setAutoScroll(false);
          setUserScrolled(true);
        }
      }
    },
    [handleLoadOlder]
  );

  useEffect(() => {
    const c = containerRef.current;
    c?.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      c?.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (autoScroll && !userScrolled && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, autoScroll, userScrolled]);

  const scrollToBottom = useCallback(() => {
    setAutoScroll(true);
    setUserScrolled(false);
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const css = `
    /* 主容器 */
    .chat-messages__container {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      overflow: hidden;
      background: ${theme.background};
    }

    /* 消息列表容器 */
    .chat-messages__list {
      flex: 1 1 auto;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: ${theme.space?.[4] || "16px"};
      padding: ${theme.space?.[6] || "24px"} 15%;
      scroll-behavior: auto;
      overscroll-behavior: contain;
      z-index: 1;
      scrollbar-width: thin;
      scrollbar-color: ${theme.border} transparent;
    }

    /* 自定义滚动条 */
    .chat-messages__list::-webkit-scrollbar { 
      width: 8px; 
    }
    .chat-messages__list::-webkit-scrollbar-track { 
      background: transparent; 
    }
    .chat-messages__list::-webkit-scrollbar-thumb {
      background-color: ${theme.border};
      border-radius: 4px;
      border: 2px solid ${theme.background};
      transition: background-color 0.2s ease;
    }
    .chat-messages__list::-webkit-scrollbar-thumb:hover {
      background-color: ${theme.borderHover};
    }

    /* 消息出现动画 */
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

    /* 消息包装器 */
    .chat-messages__item-wrapper {
      opacity: 0;
      transform: translateY(15px);
      animation: chat-messages__message-appear 0.3s ease-out forwards;
      will-change: transform, opacity;
    }

    /* 顶部加载指示器动画 */
    .top-loading {
      animation: slide-down 0.3s ease-out;
    }

    @keyframes slide-down {
      from { 
        opacity: 0; 
        transform: translateY(-20px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }

    /* 响应式动画优化 */
    @media (max-width: 1024px) {
      .chat-messages__list {
        padding: ${theme.space?.[5] || "20px"} 10%;
        gap: ${theme.space?.[3] || "12px"};
      }
      
      .chat-messages__item-wrapper {
        animation-duration: 0.25s;
      }
    }

    @media (max-width: 768px) {
      .chat-messages__list {
        padding: ${theme.space?.[4] || "16px"} ${theme.space?.[3] || "12px"};
        gap: ${theme.space?.[2] || "8px"};
      }
      
      /* 移动端减少动画以提升性能 */
      .chat-messages__item-wrapper {
        animation-duration: 0.2s;
      }
    }

    /* 减弱动画 - 用户偏好设置 */
    @media (prefers-reduced-motion: reduce) {
      .chat-messages__item-wrapper,
      .top-loading {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;

  return (
    <div
      className={`chat-messages__container ${isLoadingOlder ? "loading-older" : ""}`}
    >
      <div
        ref={containerRef}
        className="chat-messages__list"
        role="log"
        aria-live="polite"
      >
        {isLoadingOlder && (
          <div className="top-loading">
            <TopLoadingIndicator />
          </div>
        )}

        {messages.map((msg, idx) => {
          const key = msg.id || `msg-fallback-${idx}`;
          const animationDelay = Math.min(idx * 0.03, 0.5);

          return (
            <div
              key={key}
              className="chat-messages__item-wrapper"
              style={{
                animationDelay: `${animationDelay}s`,
                "--msg-index": idx,
              }}
            >
              <MessageItem message={msg} />
            </div>
          );
        })}
      </div>

      <ScrollToBottomButton isVisible={!autoScroll} onClick={scrollToBottom} />

      <style>{css}</style>
    </div>
  );
};

export default MessagesList;
