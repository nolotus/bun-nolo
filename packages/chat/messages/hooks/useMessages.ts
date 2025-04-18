import { useState, useEffect, useCallback } from "react";
import { pipe } from "rambda";
import { getLatestMessages } from "../dialogMessageOperations";
import { useAppDispatch } from "app/hooks";
import { upsertMany } from "database/dbSlice";

export const useMessages = (db, dialogId, limit = 100) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useAppDispatch();

  const fetchMessages = useCallback(async () => {
    if (!db || !dialogId) return;

    try {
      setLoading(true);
      const result = await getLatestMessages(db, dialogId, limit);

      const processMessages = pipe(
        (messages) => [...messages].sort((a, b) => a.timestamp - b.timestamp),
        (messages) => messages.filter(Boolean)
      );

      const processedMessages = processMessages(result);
      setMessages(processedMessages);
      dispatch(upsertMany(result));
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [db, dialogId, limit, dispatch]);

  // 初始加载
  useEffect(() => {
    fetchMessages();

    return () => {
      setMessages([]);
      setError(null);
    };
  }, [dialogId, limit]);

  return {
    messages,
    loading,
    error,
    refresh: fetchMessages, // 暴露刷新方法
  };
};
