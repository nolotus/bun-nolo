// chat/messages/web/MessageList.tsx
import React, {
  useRef,
  useLayoutEffect,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectAllMsgs,
  selectMessagesLoadingState,
  loadOlderMessages,
  selectLastStreamTimestamp,
  // ⬇️ 假设你有一个删除消息的 action，名字可能不一样
  // import 之后在下面 handleDeleteToolMessage 里用
  // deleteMessageById,
} from "chat/messages/messageSlice";
import MessageItem from "./MessageItem";
import { ToolMessageItem } from "./ToolMessageItem";
import TopLoadingIndicator from "./TopLoadingIndicator";
import { ScrollToBottomButton } from "chat/web/ScrollToBottomButton";

const LOAD_THRESHOLD = 50;
const SCROLL_CONTAINER_SELECTOR = ".MainLayout__main";

interface MessagesListProps {
  dialogId: string;
}

const MessagesList: React.FC<MessagesListProps> = ({ dialogId }) => {
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
    scrollContainer: null as HTMLElement | null,
    isNearBottom: true,
  });
  stateRef.current.isLoadingOlder = isLoadingOlder;
  stateRef.current.hasMoreOlder = hasMoreOlder;

  // 查找滚动容器（MainLayout__main）
  const getScroller = useCallback(() => {
    return listRef.current?.closest(SCROLL_CONTAINER_SELECTOR) as HTMLElement;
  }, []);

  // 统一一个带轻微延迟的滚到底部方法
  const scrollToBottomWithDelay = useCallback(
    (opts?: { behavior?: ScrollBehavior; delayMs?: number }) => {
      const scroller = getScroller() ?? stateRef.current.scrollContainer;
      if (!scroller) return;

      const { behavior = "smooth", delayMs = 60 } = opts || {};

      window.setTimeout(() => {
        scroller.scrollTo({
          top: scroller.scrollHeight,
          behavior,
        });
      }, delayMs);
    },
    [getScroller]
  );

  // 自动滚动逻辑
  useLayoutEffect(() => {
    const scroller = getScroller();
    if (!scroller) return;

    // 首次加载：滚到底部（加一点点延迟）
    if (stateRef.current.isInitialLoad && messages.length > 0) {
      scrollToBottomWithDelay({ behavior: "auto", delayMs: 60 });
      stateRef.current.isInitialLoad = false;
      stateRef.current.prevMessagesLength = messages.length;
      return;
    }

    // 新消息：如果接近底部，则自动跟随（同样加一点延迟）
    if (messages.length > stateRef.current.prevMessagesLength) {
      if (stateRef.current.isNearBottom) {
        scrollToBottomWithDelay({ behavior: "smooth", delayMs: 60 });
      }
    }

    stateRef.current.prevMessagesLength = messages.length;
  }, [messages, lastStreamTimestamp, getScroller, scrollToBottomWithDelay]);

  // 加载旧消息
  const handleLoadOlder = useCallback(() => {
    if (
      stateRef.current.isLoadingOlder ||
      !stateRef.current.hasMoreOlder ||
      messages.length === 0
    )
      return;

    const scroller = getScroller();
    if (scroller) {
      const prevScrollHeight = scroller.scrollHeight;
      const prevScrollTop = scroller.scrollTop;

      const oldestMessage = messages[0];
      const beforeKey = (oldestMessage as any).dbKey ?? oldestMessage.id;

      if (beforeKey) {
        dispatch(loadOlderMessages({ dialogId, beforeKey })).then(() => {
          const currentScroller = getScroller();
          if (currentScroller) {
            const heightDiff = currentScroller.scrollHeight - prevScrollHeight;
            // 这里直接恢复旧位置，不需要额外延迟
            currentScroller.scrollTop = prevScrollTop + heightDiff;
          }
        });
      }
    }
  }, [dispatch, messages, dialogId, getScroller]);

  // 滚动监听
  const handleScroll = useCallback(() => {
    const scroller = stateRef.current.scrollContainer;
    if (!scroller) return;

    // 顶部阈值触发加载旧消息
    if (scroller.scrollTop < LOAD_THRESHOLD) {
      handleLoadOlder();
    }

    // 是否接近底部
    const isAtBottomNow =
      scroller.scrollHeight - scroller.clientHeight <= scroller.scrollTop + 150;
    stateRef.current.isNearBottom = isAtBottomNow;

    // 是否显示“回到底部”按钮
    const shouldShowButton =
      scroller.scrollHeight - scroller.clientHeight > scroller.scrollTop + 100;

    setShowScrollToBottom(isAtBottomNow ? false : shouldShowButton);
  }, [handleLoadOlder]);

  // 绑定滚动事件
  useEffect(() => {
    const scroller = getScroller();
    if (scroller) {
      stateRef.current.scrollContainer = scroller;
      scroller.addEventListener("scroll", handleScroll, { passive: true });
      return () => scroller.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, getScroller]);

  // 回到底部按钮：也轻微延迟一下
  const scrollToBottom = useCallback(() => {
    scrollToBottomWithDelay({ behavior: "smooth", delayMs: 80 });
  }, [scrollToBottomWithDelay]);

  // 样式：这里只负责「垂直列表」，不管页面宽度
  const css = `
    .chat-messages__list-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 0;
    }

    .chat-messages__list {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding-block: var(--space-4);
      gap: var(--space-2);
    }

    @media (min-width: 768px) {
      .chat-messages__list {
        padding-block: var(--space-5);
        gap: var(--space-3);
      }
    }

    @media (min-width: 1024px) {
      .chat-messages__list {
        padding-block: var(--space-6);
        gap: var(--space-4);
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
      display: flex;
      justify-content: center;
      padding: var(--space-2);
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

        {messages.map((msg, idx) => {
          const isTool = msg.role === "tool";
          return (
            <div
              key={msg.id}
              className="chat-messages__item-wrapper"
              style={{ animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}
            >
              {isTool ? (
                <ToolMessageItem message={msg} />
              ) : (
                <MessageItem message={msg} />
              )}
            </div>
          );
        })}
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
