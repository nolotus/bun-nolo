import React, { useRef, useLayoutEffect, useCallback, useState } from "react";
import { useTheme } from "app/theme";
import { useAppSelector, useAppDispatch } from "app/hooks";
import {
  selectAllMsgs, // 直接使用 adapter 的 selector
  selectMessagesLoadingState, // 使用组合 selector
  loadOlderMessages,
} from "chat/messages/messageSlice";
import MessageItem from "./MessageItem";
import TopLoadingIndicator from "./TopLoadingIndicator";
import { ScrollToBottomButton } from "chat/web/ScrollToBottomButton";

const LOAD_THRESHOLD = 50; // 滚动到顶部多少像素时触发加载

const MessagesList: React.FC<MessagesListProps> = ({ dialogId }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // 1. 使用更直接和集中的 Selector
  const messages = useAppSelector(selectAllMsgs);
  const { isLoadingOlder, hasMoreOlder } = useAppSelector(
    selectMessagesLoadingState
  );

  const listRef = useRef<HTMLDivElement>(null);
  // Ref 用于在回调函数中访问最新的状态，避免回调函数自身依赖项过多
  const stateRef = useRef({ isLoadingOlder, hasMoreOlder, messages, dialogId });
  stateRef.current = { isLoadingOlder, hasMoreOlder, messages, dialogId };

  // 新状态：用于控制“滚动到底部”按钮的显示
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // 2. 修复滚动跳动 & 简化自动滚动 (核心改动)
  useLayoutEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    // 获取渲染前的快照
    const { scrollHeight: prevScrollHeight, scrollTop: prevScrollTop } = listEl;

    // 决定渲染后要做什么：'LOAD_OLDER' 或 'AUTO_SCROLL'
    const action = listEl.dataset.scrollAction;

    if (action === "LOAD_OLDER") {
      // 加载旧消息后，恢复滚动位置以防止跳动
      listEl.scrollTop =
        prevScrollTop + (listEl.scrollHeight - prevScrollHeight);
      delete listEl.dataset.scrollAction; // 清理标记
    } else {
      // 检查渲染前是否在底部
      const wasAtBottom =
        prevScrollHeight - listEl.clientHeight <= prevScrollTop + 1;
      if (wasAtBottom) {
        // 如果是，则在新消息渲染后自动滚动到底部
        listEl.scrollTop = listEl.scrollHeight;
      }
    }
  }, [messages]); // 仅在消息列表变化时运行

  // 3. 稳定化的回调函数，避免事件监听器重复绑定
  const handleLoadOlder = useCallback(() => {
    const { isLoadingOlder, hasMoreOlder, messages, dialogId } =
      stateRef.current;
    if (isLoadingOlder || !hasMoreOlder || messages.length === 0) return;

    const listEl = listRef.current;
    if (listEl) {
      // 在 dispatch 前标记，让 useLayoutEffect 知道要做什么
      listEl.dataset.scrollAction = "LOAD_OLDER";
    }

    const oldestMessage = messages[0];
    const beforeKey = (oldestMessage as any).dbKey ?? oldestMessage.id;
    if (beforeKey) {
      dispatch(loadOlderMessages({ dialogId, beforeKey }));
    }
  }, [dispatch]); // dispatch 是稳定函数，此回调仅创建一次

  const handleScroll = useCallback(
    (event: Event) => {
      const listEl = event.currentTarget as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = listEl;

      // 触发加载旧消息
      if (scrollTop < LOAD_THRESHOLD) {
        handleLoadOlder();
      }

      // 判断是否在底部，以控制“滚动到底部”按钮的显示
      const atBottom = scrollHeight - (scrollTop + clientHeight) < 1;
      setShowScrollToBottom(!atBottom);
    },
    [handleLoadOlder]
  ); // 依赖于稳定的 handleLoadOlder

  // 仅在组件挂载时添加一次事件监听器
  useLayoutEffect(() => {
    const listEl = listRef.current;
    if (listEl) {
      listEl.addEventListener("scroll", handleScroll, { passive: true });
      return () => listEl.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]); // 依赖于稳定的 handleScroll

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth", // 使用平滑滚动体验更好
    });
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
            key={msg.id} // 直接使用ID作为key
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

      <style>{css}</style>
    </div>
  );
};

export default MessagesList;
