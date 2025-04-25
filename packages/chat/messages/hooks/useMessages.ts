import { useState, useEffect, useCallback } from "react";
import { pipe, sort } from "rambda";
import { useAppDispatch } from "app/hooks";
import { upsertMany } from "database/dbSlice";
import { fetchMessages } from "chat/messages/fetchMessages";
import { useSelector } from "react-redux";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";

// 配置常量
const SERVER_TIMEOUT = 5000;
const SERVERS = ["https://cybot.one", "https://cybot.run"];

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout = SERVER_TIMEOUT
) => {
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
    throw error;
  }
};

const fetchRemoteMessages = async (
  server: string,
  dialogId: string,
  token: string,
  limit: number
) => {
  try {
    const response = await fetchWithTimeout(`${server}/rpc/getConvMsgs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dialogId, limit }),
    });
    return (await response.json()) || [];
  } catch (error) {
    console.error(`从 ${server} 获取消息失败:`, error);
    return [];
  }
};

export const useMessages = (db: any, dialogId: string, limit = 100) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useAppDispatch();
  const currentServer = useSelector(selectCurrentServer);
  const token = useSelector(selectCurrentToken);

  const fetchMessagesData = useCallback(async () => {
    if (!db || !dialogId) return;
    setLoading(true);
    try {
      const localMessages = await fetchMessages(db, dialogId, limit, false);
      const allServers = [currentServer, ...SERVERS].filter(Boolean);
      let remoteMessages = [];
      if (token && allServers.length) {
        const remoteResults = await Promise.all(
          allServers.map((server) =>
            fetchRemoteMessages(server, dialogId, token, limit)
          )
        );
        remoteMessages = remoteResults.flat();
      }

      const messageMap = new Map<string, any>();
      [...localMessages, ...remoteMessages].forEach(
        (msg) => msg.id && messageMap.set(msg.id, msg)
      );
      const mergedMessages = Array.from(messageMap.values());

      const processedMessages = pipe(
        (msgs: any[]) =>
          sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return aTime - bTime;
          }, msgs),
        (msgs: any[]) =>
          msgs.filter(
            (msg) =>
              msg &&
              typeof msg === "object" &&
              (msg.content || msg.content === "")
          )
      )(mergedMessages);

      setMessages(processedMessages);
      dispatch(upsertMany(mergedMessages));
      setError(null);
    } catch (err) {
      setError(err);
      console.error("获取消息出错:", err);
    } finally {
      setLoading(false);
    }
  }, [db, dialogId, limit, currentServer, token, dispatch]);

  useEffect(() => {
    fetchMessagesData();
    return () => {
      setMessages([]);
      setError(null);
    };
  }, [dialogId, limit, fetchMessagesData]);

  return { messages, loading, error, refresh: fetchMessagesData };
};
