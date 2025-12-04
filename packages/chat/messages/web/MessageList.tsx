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
} from "chat/messages/messageSlice";
import MessageItem from "./MessageItem";
import { ToolMessageItem } from "./ToolMessageItem";
import TopLoadingIndicator from "./TopLoadingIndicator";
import { ScrollToBottomButton } from "chat/web/ScrollToBottomButton";

const LOAD_THRESHOLD = 50;
// 定义新的滚动容器类名常量，方便维护
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
    scrollContainer: null as HTMLElement | null, // 类型修正为 HTMLElement
    isNearBottom: true,
  });
  stateRef.current.isLoadingOlder = isLoadingOlder;
  stateRef.current.hasMoreOlder = hasMoreOlder;

  // --- 1. 查找滚动容器的辅助函数 ---
  const getScroller = useCallback(() => {
    // 尝试查找最近的滚动容器
    return listRef.current?.closest(SCROLL_CONTAINER_SELECTOR) as HTMLElement;
  }, []);

  // --- 2. 布局副作用：处理自动滚动 ---
  useLayoutEffect(() => {
    const scroller = getScroller();
    if (!scroller) return;

    // 初始加载：直接滚到底部
    if (stateRef.current.isInitialLoad && messages.length > 0) {
      scroller.scrollTop = scroller.scrollHeight;
      stateRef.current.isInitialLoad = false;
      return;
    }

    // 新消息到达：如果是 AI 生成的流式消息或用户就在底部，自动跟随
    if (messages.length > stateRef.current.prevMessagesLength) {
      if (stateRef.current.isNearBottom) {
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
      }
    }

    stateRef.current.prevMessagesLength = messages.length;
  }, [messages, lastStreamTimestamp, getScroller]);

  // --- 3. 加载旧消息逻辑 ---
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
          // 加载完成后，恢复滚动位置，保持视觉稳定
          const currentScroller = getScroller();
          if (currentScroller) {
            const heightDiff = currentScroller.scrollHeight - prevScrollHeight;
            currentScroller.scrollTop = prevScrollTop + heightDiff;
          }
        });
      }
    }
  }, [dispatch, messages, dialogId, getScroller]);

  // --- 4. 滚动监听处理 ---
  const handleScroll = useCallback(() => {
    const scroller = stateRef.current.scrollContainer;
    if (!scroller) return;

    // 顶部阈值触发加载旧消息
    if (scroller.scrollTop < LOAD_THRESHOLD) {
      handleLoadOlder();
    }

    // 判断是否接近底部 (误差容忍度 150px)
    const isAtBottomNow =
      scroller.scrollHeight - scroller.clientHeight <= scroller.scrollTop + 150;
    stateRef.current.isNearBottom = isAtBottomNow;

    // 决定是否显示“回到底部”按钮 (稍微上滑一点就显示)
    const shouldShowButton =
      scroller.scrollHeight - scroller.clientHeight > scroller.scrollTop + 100;

    // 如果已经在底部，强制不显示
    setShowScrollToBottom(isAtBottomNow ? false : shouldShowButton);
  }, [handleLoadOlder]);

  // --- 5. 绑定事件监听 ---
  useEffect(() => {
    const scroller = getScroller();
    if (scroller) {
      stateRef.current.scrollContainer = scroller;
      scroller.addEventListener("scroll", handleScroll, { passive: true });
      return () => scroller.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, getScroller]);

  // --- 6. 点击回到底部 ---
  const scrollToBottom = useCallback(() => {
    stateRef.current.scrollContainer?.scrollTo({
      top: stateRef.current.scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const css = `
    .chat-messages__list-wrapper {
      /* 这里的修改是为了配合 main 的流动布局 */
      display: flex;
      flex-direction: column;
      justify-content: flex-end; /* 消息少时靠下，如果不想要可以改成 flex-start */
      width: 100%;
      min-height: 100%; /* 确保撑满高度 */
    }
    .chat-messages__list {
      width: 100%;
      margin: 0 auto;
      padding: var(--space-4) var(--space-3);
      padding-bottom: var(--space-8); /* 底部留白，避免贴底 */
      gap: var(--space-2);
    }
    
    @media (min-width: 768px) {
      .chat-messages__list {
        padding: var(--space-5) var(--space-8);
        gap: var(--space-3);
      }
    }

    @media (min-width: 1024px) {
      .chat-messages__list {
        padding: var(--space-6) var(--space-12);
        gap: var(--space-4);
      }
    }

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

      {/* 滚动按钮现在会根据 handleScroll 的状态正确显示 */}
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
