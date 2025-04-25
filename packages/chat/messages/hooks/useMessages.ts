// chat/messages/hooks/useMessages.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { sort } from "rambda";
import { useAppDispatch, useAppSelector } from "app/hooks"; // 引入 useAppSelector
import { upsertMany } from "database/dbSlice";
import {
  fetchMessages as fetchLocalMessages,
  MessageWithKey,
} from "../fetchMessages"; // 导入 fetchLocalMessages 和 MessageWithKey
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import type { Message } from "../types";

// --- Constants ---
const SERVER_TIMEOUT = 5000;
const FALLBACK_SERVERS = ["https://cybot.one", "https://cybot.run"];
const INITIAL_LOAD_LIMIT = 50; // 初始加载数量
const OLDER_LOAD_LIMIT = 30; // 向上滚动加载数量

// --- Utility: fetchWithTimeout ---
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout = SERVER_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
};

// --- Utility: isValidMessage ---
const isValidMessage = (msg: any): msg is Message => {
  return (
    msg &&
    typeof msg === "object" &&
    typeof msg.id === "string" &&
    msg.content != null &&
    msg.createdAt != null
  );
};

// --- Utility: fetchRemoteMessages ---
const fetchRemoteMessages = async (
  server: string,
  dialogId: string,
  token: string,
  options: { limit: number; beforeKey?: string | null }
): Promise<Message[]> => {
  if (!server || !token) return [];
  try {
    const response = await fetchWithTimeout(`${server}/rpc/getConvMsgs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dialogId,
        limit: options.limit,
        beforeKey: options.beforeKey,
      }),
    });
    if (!response.ok) {
      console.error(
        `fetchRemoteMessages: Failed ${response.status} from ${server}`
      );
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data.filter(isValidMessage) : []; // 过滤无效消息
  } catch (error) {
    console.error(`fetchRemoteMessages: Error fetching from ${server}:`, error);
    return [];
  }
};

// --- Helper: compareMessagesByTime ---
const compareMessagesByTime = (a: Message, b: Message): number => {
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  if (aTime === bTime) return a.id.localeCompare(b.id); // 稳定排序
  return aTime - bTime; // 升序 (oldest first)
};

// --- Custom Hook: useMessages ---
export const useMessages = (db: any, dialogId: string) => {
  const [messages, setMessages] = useState<MessageWithKey[]>([]); // 存储带 key 的消息，升序
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const dispatch = useAppDispatch();
  const currentServer = useAppSelector(selectCurrentServer);
  const token = useAppSelector(selectCurrentToken);

  const isLoadingOlderRef = useRef(isLoadingOlder);
  useEffect(() => {
    isLoadingOlderRef.current = isLoadingOlder;
  }, [isLoadingOlder]);

  // --- Core Fetching and Processing ---
  const fetchAndProcessBatch = useCallback(
    async (options: {
      limit: number;
      beforeKey?: string | null;
    }): Promise<{
      processedBatchAsc: MessageWithKey[];
      receivedCount: number;
    }> => {
      // 1. Fetch Local Batch (newest first, with _key)
      const localBatchDesc = await fetchLocalMessages(db, dialogId, {
        ...options,
        throwOnError: false,
      });
      const receivedCount = localBatchDesc.length;

      // 2. Fetch Remote Batch (newest first, no _key guaranteed)
      let remoteBatchDesc: Message[] = [];
      if (token) {
        const uniqueServers = Array.from(
          new Set([currentServer, ...FALLBACK_SERVERS])
        ).filter(Boolean) as string[];
        if (uniqueServers.length > 0) {
          const remoteResults = await Promise.all(
            uniqueServers.map((server) =>
              fetchRemoteMessages(server, dialogId, token, options)
            )
          );
          remoteBatchDesc = remoteResults.flat(); // fetchRemoteMessages already filters
        }
      }

      // 3. Merge Local and Remote (Remote updates content, Local provides _key)
      const messageMap = new Map<string, MessageWithKey>();
      localBatchDesc.forEach((localMsg) =>
        messageMap.set(localMsg.id, localMsg)
      );
      remoteBatchDesc.forEach((remoteMsg) => {
        const existing = messageMap.get(remoteMsg.id);
        messageMap.set(remoteMsg.id, {
          ...(existing || remoteMsg), // Base: existing if present (for _key), else remote
          ...remoteMsg, // Apply remote updates
          _key: existing?._key || `remote-${remoteMsg.id}`, // **Crucial: Ensure _key exists**
        });
      });
      const mergedBatchDesc = Array.from(messageMap.values());

      // 4. Sort the *merged batch* ASC (oldest first)
      const processedBatchAsc = sort(compareMessagesByTime, mergedBatchDesc);

      // 5. Upsert into DB (background)
      if (processedBatchAsc.length > 0) {
        const messagesToUpsert = processedBatchAsc.map(
          ({ _key, ...msg }) => msg
        );
        dispatch(upsertMany(messagesToUpsert));
      }

      return { processedBatchAsc, receivedCount };
    },
    [db, dialogId, token, currentServer, dispatch]
  );

  // --- Initial Load ---
  const loadInitialMessages = useCallback(async () => {
    if (!db || !dialogId) {
      /* Reset state */ setMessages([]);
      setHasMoreOlder(true);
      return;
    }
    console.log(`useMessages: Initial load for ${dialogId}`);
    setIsLoadingInitial(true);
    setError(null);
    setHasMoreOlder(true);

    try {
      const { processedBatchAsc, receivedCount } = await fetchAndProcessBatch({
        limit: INITIAL_LOAD_LIMIT,
        beforeKey: null,
      });
      setMessages(processedBatchAsc); // Set messages (ASC sorted)
      if (receivedCount < INITIAL_LOAD_LIMIT) setHasMoreOlder(false); // Check if less than limit received
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setMessages([]);
    } finally {
      setIsLoadingInitial(false);
    }
  }, [db, dialogId, fetchAndProcessBatch]);

  // --- Load Older ---
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlderRef.current || !hasMoreOlder || messages.length === 0)
      return;

    const oldestMessageKey = messages[0]?._key;
    if (!oldestMessageKey || oldestMessageKey.startsWith("remote-")) {
      // Check for valid key
      console.warn(
        "useMessages: Cannot load older, invalid oldest key:",
        oldestMessageKey
      );
      setHasMoreOlder(false);
      return;
    }

    console.log(`useMessages: Loading older before key ${oldestMessageKey}`);
    setIsLoadingOlder(true);
    setError(null);

    try {
      const { processedBatchAsc, receivedCount } = await fetchAndProcessBatch({
        limit: OLDER_LOAD_LIMIT,
        beforeKey: oldestMessageKey,
      });
      if (processedBatchAsc.length > 0) {
        // Prepend older messages (already ASC sorted)
        setMessages((currentMessages) => [
          ...processedBatchAsc,
          ...currentMessages,
        ]);
      }
      if (receivedCount < OLDER_LOAD_LIMIT) setHasMoreOlder(false); // Check if less than limit received
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoadingOlder(false);
    }
  }, [messages, hasMoreOlder, fetchAndProcessBatch]); // Dependencies

  // --- Effect for Initial Load & Cleanup ---
  useEffect(() => {
    loadInitialMessages(); // Load on dialogId change
    return () => {
      // Cleanup on unmount or dialogId change
      setMessages([]);
      setError(null);
      setIsLoadingInitial(false);
      setIsLoadingOlder(false);
      setHasMoreOlder(true);
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
