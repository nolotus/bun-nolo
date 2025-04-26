import { useEffect, useCallback, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  fetchMessages as fetchLocalMessages,
  MessageWithKey,
} from "../fetchMessages";
import { initMsgs, selectMessagesState } from "../messageSlice";
import type { Message } from "../types";
import { sort } from "rambda";

// --- Constants ---
const INITIAL_LOAD_LIMIT = 50; // 初始加载数量
const OLDER_LOAD_LIMIT = 30; // 向上滚动加载数量

// --- Helper: compareMessagesByTime ---
const compareMessagesByTime = (a: Message, b: Message): number => {
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  if (aTime === bTime) return a.id.localeCompare(b.id); // 稳定排序
  return aTime - bTime; // 升序 (oldest first)
};

// --- Custom Hook: useMessages ---
export const useMessages = (db: any, dialogId: string) => {
  const dispatch = useAppDispatch();
  const { messages, isLoadingInitial, isLoadingOlder, hasMoreOlder, error } =
    useAppSelector(selectMessagesState);

  const isLoadingOlderRef = useRef(isLoadingOlder);
  useEffect(() => {
    isLoadingOlderRef.current = isLoadingOlder;
  }, [isLoadingOlder]);

  // --- Initial Load ---
  const loadInitialMessages = useCallback(async () => {
    if (!db || !dialogId) {
      return;
    }
    console.log(`useMessages: Initial load for ${dialogId}`);

    // 调用 Redux 中的 initMsgs 来初始化消息（包括远程数据）
    await dispatch(initMsgs({ dialogId, limit: INITIAL_LOAD_LIMIT })).unwrap();
  }, [db, dialogId, dispatch]);

  // --- Load Older ---
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlderRef.current || !hasMoreOlder || messages.length === 0)
      return;

    const oldestMessageKey = messages[0]?._key;
    if (!oldestMessageKey || oldestMessageKey.startsWith("remote-")) {
      console.warn(
        "useMessages: Cannot load older, invalid oldest key:",
        oldestMessageKey
      );
      return;
    }

    console.log(`useMessages: Loading older before key ${oldestMessageKey}`);
    // TODO: 在未来添加加载更多消息的逻辑
    // 目前仅作为占位符，实际逻辑需要在 messageSlice 中实现
  }, [messages, hasMoreOlder, isLoadingOlder]);

  // --- Effect for Initial Load & Cleanup ---
  useEffect(() => {
    loadInitialMessages(); // Load on dialogId change
    return () => {
      // Cleanup on unmount or dialogId change
      // TODO: 如果需要清理状态，可以在这里添加逻辑
    };
  }, [dialogId, loadInitialMessages]); // Depend on stable loadInitialMessages

  // --- Return Value ---
  return {
    messages,
    isLoadingInitial,
    isLoadingOlder,
    hasMoreOlder,
    error,
    loadOlderMessages,
    refresh: loadInitialMessages,
  };
};
