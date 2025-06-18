// /chat/messages/web/MessageList.tsx

import React, {
  useRef,
  useLayoutEffect,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useTheme } from "app/theme";
import { useAppSelector, useAppDispatch } from "app/hooks";
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
    // 判断条件：这是不是组件的第一次有效渲染（从没有消息到有消息）
    if (stateRef.current.isInitialLoad && messages.length > 0) {
      // 动作：直接滚动到底部，不使用平滑效果，以立即定位
      listEl.scrollTop = listEl.scrollHeight;
      stateRef.current.isInitialLoad = false; // 标记初始加载已完成
      return; // 完成本次任务，退出
    }

    // 【需求 1: 用户发送消息滚动最下】
    // 判断条件：消息数量增加，且最新一条消息的角色是 'user'
    if (
      messages.length > stateRef.current.prevMessagesLength &&
      lastMessage?.role === "user"
    ) {
      // 动作：无条件平滑滚动到底部
      listEl.scrollTo({ top: listEl.scrollHeight, behavior: "smooth" });
    }
    // 【需求 2 & 4: stream 跟随滚动 & 用户往上滚动时不要阻止】
    // 判断条件：适用于所有其他情况，如AI新消息或AI流式更新
    else {
      // 检查用户是否已经滚动到了接近底部的位置
      const isNearBottom =
        listEl.scrollHeight - listEl.clientHeight <= listEl.scrollTop + 150; // 150px的缓冲区域

      // 动作：只有在接近底部时，才自动滚动，以避免打断用户查看历史记录
      if (isNearBottom) {
        listEl.scrollTo({ top: listEl.scrollHeight, behavior: "smooth" });
      }
    }

    // 在 Effect 的最后，更新上一轮的消息数量，为下一次对比做准备
    stateRef.current.prevMessagesLength = messages.length;
  }, [messages, lastStreamTimestamp]); // 依赖项确保了任何消息变动都会触发此逻辑

  const handleLoadOlder = useCallback(() => {
    // 使用 stateRef 获取最新的状态，避免回调依赖问题
    if (
      stateRef.current.isLoadingOlder ||
      !stateRef.current.hasMoreOlder ||
      messages.length === 0
    )
      return;

    if (listRef.current) {
      // 在加载前记录当前滚动高度，加载后用于恢复位置，防止跳动
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
    .chat-messages__container { display: flex; flex-direction: column; height: 100%; position: relative; overflow: hidden; background: ${theme.background}; }
    .chat-messages__list { flex: 1 1 auto; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; gap: ${theme.space?.[4] || "16px"}; padding: ${theme.space?.[6] || "24px"} 15%; scroll-behavior: auto; overscroll-behavior: contain; z-index: 1; scrollbar-width: thin; scrollbar-color: ${theme.border} transparent; }
    .chat-messages__list::-webkit-scrollbar { width: 8px; }
    .chat-messages__list::-webkit-scrollbar-track { background: transparent; }
    .chat-messages__list::-webkit-scrollbar-thumb { background-color: ${theme.border}; border-radius: 4px; border: 2px solid ${theme.background}; transition: background-color 0.2s ease; }
    .chat-messages__list::-webkit-scrollbar-thumb:hover { background-color: ${theme.borderHover}; }
    @keyframes chat-messages__message-appear { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    .chat-messages__item-wrapper { opacity: 0; transform: translateY(15px); animation: chat-messages__message-appear 0.3s ease-out forwards; will-change: transform, opacity; }
    .top-loading { animation: slide-down 0.3s ease-out; }
    @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 1024px) { .chat-messages__list { padding: ${theme.space?.[5] || "20px"} 10%; gap: ${theme.space?.[3] || "12px"}; } .chat-messages__item-wrapper { animation-duration: 0.25s; } }
    @media (max-width: 768px) { .chat-messages__list { padding: ${theme.space?.[4] || "16px"} ${theme.space?.[3] || "12px"}; gap: ${theme.space?.[2] || "8px"}; } .chat-messages__item-wrapper { animation-duration: 0.2s; } }
    @media (prefers-reduced-motion: reduce) { .chat-messages__item-wrapper, .top-loading { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }
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
      <style>{css}</style>
    </div>
  );
};

export default MessagesList;
