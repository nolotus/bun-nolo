import { useState, useEffect } from "react";
import { pipe } from "rambda";
import { getLatestMessages } from "../dialogMessageOperations";
import { useAppDispatch } from "app/hooks";
import { upsertMany } from "database/dbSlice";

export const useMessages = (db, dialogId, limit = 20) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const result = await getLatestMessages(db, dialogId, limit);

        const processMessages = pipe(
          // 按时间排序
          (messages) => [...messages].sort((a, b) => a.timestamp - b.timestamp),
          // 过滤空值
          (messages) => messages.filter(Boolean)
        );

        setMessages(processMessages(result));
        dispatch(upsertMany(result));

        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (db && dialogId) {
      fetchMessages();
    }

    return () => {
      setMessages([]);
      setError(null);
    };
  }, [db, dialogId, limit]);

  return {
    messages,
    loading,
    error,
  };
};
