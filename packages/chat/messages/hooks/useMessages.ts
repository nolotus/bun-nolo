import { useState, useEffect, useCallback } from "react";
import { pipe, sort } from "rambda"; // Rambda 用于函数式编程风格
import { useAppDispatch } from "app/hooks";
import { upsertMany } from "database/dbSlice"; // Redux action 更新数据库
import { fetchMessages as fetchLocalMessages } from "chat/messages/fetchMessages"; // 获取本地消息的函数
import { useSelector } from "react-redux";
import { selectCurrentServer } from "setting/settingSlice"; // Redux selector 获取当前服务器
import { selectCurrentToken } from "auth/authSlice"; // Redux selector 获取 token

// --- Constants ---
const SERVER_TIMEOUT = 5000; // 服务器请求超时时间
const FALLBACK_SERVERS = ["https://cybot.one", "https://cybot.run"]; // 备用服务器列表

// --- Utility Functions ---

// 带超时的 fetch 请求
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
    clearTimeout(timeoutId); // 成功则清除超时
    return response;
  } catch (error) {
    clearTimeout(timeoutId); // 出错也要清除超时
    // 如果是 AbortError，可以包装成更友好的超时错误
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error; // 重新抛出其他错误
  }
};

// 从远程服务器获取消息
const fetchRemoteMessages = async (
  server: string,
  dialogId: string,
  token: string,
  limit: number
): Promise<Message[]> => {
  if (!server || !token) return []; // 防御性检查
  try {
    const response = await fetchWithTimeout(`${server}/rpc/getConvMsgs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dialogId, limit }),
    });

    if (!response.ok) {
      // 处理非 2xx 响应
      console.error(`从 ${server} 获取消息失败: HTTP ${response.status}`);
      // 可以尝试读取错误信息 response.text() 或 response.json()
      return [];
    }

    const data = await response.json();
    // 假设服务器返回的是消息数组，进行基本验证
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`从 ${server} 获取消息时出错:`, error);
    return []; // 出错时返回空数组
  }
};

// --- Helper Functions for Message Processing ---

// 消息排序比较函数 (确保 createdAt 有效)
const compareMessagesByTime = (a: Message, b: Message): number => {
  // 提供默认值 0 以处理无效或缺失的 createdAt
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  // 如果时间戳无效或相同，可以考虑增加次要排序依据，如 id
  if (aTime === bTime) {
    return a.id.localeCompare(b.id); // 用 id 作为次要排序，保证稳定性
  }
  return aTime - bTime; // 升序排序
};

// 消息有效性过滤函数
const isValidMessage = (msg: any): msg is Message => {
  // 确保 msg 是对象，且 content 字段存在 (非 null/undefined)
  // id 和 createdAt 也是核心字段，可以加入检查
  return (
    msg &&
    typeof msg === "object" &&
    typeof msg.id === "string" &&
    msg.content != null && // 允许空字符串 ""
    msg.createdAt != null
  );
};

// --- Custom Hook: useMessages ---

/**
 * Hook 用于加载、合并、处理和管理指定对话的消息列表。
 * @param db - PouchDB/CouchDB 数据库实例 (或其他本地存储实例)
 * @param dialogId - 当前对话的 ID
 * @param limit - 每次加载的消息数量限制
 */
export const useMessages = (db: any, dialogId: string, limit = 100) => {
  // --- State ---
  const [messages, setMessages] = useState<Message[]>([]); // 存储最终显示的消息
  const [loading, setLoading] = useState(false); // 加载状态
  const [error, setError] = useState<Error | null>(null); // 错误状态

  // --- Redux ---
  const dispatch = useAppDispatch();
  const currentServer = useSelector(selectCurrentServer); // 当前偏好的服务器
  const token = useSelector(selectCurrentToken); // 用户认证 Token

  // --- Data Fetching Logic ---
  const fetchMessagesData = useCallback(async () => {
    // 防止在缺少必要参数时执行
    if (!db || !dialogId) {
      setMessages([]); // 清空消息
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    let processedLocalMessages: Message[] = []; // 保存处理后的本地消息

    try {
      // === 1. 加载并优先显示本地消息 ===
      const rawLocalMessages = await fetchLocalMessages(db, dialogId, limit); // 假设 fetchLocalMessages 返回 Message[] 或 any[]

      // 处理本地消息：过滤无效数据 -> 排序
      processedLocalMessages = pipe(
        (msgs: any[]) => msgs.filter(isValidMessage), // 先过滤
        (msgs: Message[]) => sort(compareMessagesByTime, msgs) // 再排序
      )(rawLocalMessages);

      // 立即更新 UI，显示本地数据，提高感知性能
      setMessages(processedLocalMessages);
      console.log(`显示了 ${processedLocalMessages.length} 条本地消息`);

      // === 2. (后台) 获取远程消息 ===
      let remoteMessages: Message[] = [];
      if (token) {
        // 确保服务器列表唯一且有效
        const uniqueServers = Array.from(
          new Set([currentServer, ...FALLBACK_SERVERS])
        ).filter(Boolean) as string[];
        console.log("尝试从服务器获取消息:", uniqueServers);

        if (uniqueServers.length > 0) {
          const remoteResults = await Promise.all(
            uniqueServers.map((server) =>
              fetchRemoteMessages(server, dialogId, token, limit)
            )
          );
          // 将所有服务器返回的结果合并，并过滤一次无效消息（以防服务器返回脏数据）
          remoteMessages = remoteResults.flat().filter(isValidMessage);
          console.log(`从远程获取了 ${remoteMessages.length} 条有效消息`);
        }
      } else {
        console.log("无 Token，跳过远程消息获取");
      }

      // === 3. 合并、处理最终列表并更新状态和数据库 ===
      // 使用 Map 合并，远程消息会覆盖本地同 ID 消息（如果远程更新）
      const messageMap = new Map<string, Message>();
      // 先加入处理过的本地消息
      processedLocalMessages.forEach((msg) => messageMap.set(msg.id, msg));
      // 再加入（并可能覆盖）远程消息
      remoteMessages.forEach((msg) => messageMap.set(msg.id, msg));

      // 从 Map 中提取最终合并的消息列表
      const mergedMessages = Array.from(messageMap.values());

      // 对最终合并的列表进行最后一次排序 (因为加入了远程消息，顺序可能打乱)
      const finalProcessedMessages = sort(
        compareMessagesByTime,
        mergedMessages
      );

      // 更新 UI 显示最终结果
      setMessages(finalProcessedMessages);
      console.log(`最终显示 ${finalProcessedMessages.length} 条合并消息`);

      // === 4. 一次性更新数据库 ===
      // 只将最终确认的、处理过的消息列表写入数据库
      if (finalProcessedMessages.length > 0) {
        console.log(`准备将 ${finalProcessedMessages.length} 条消息写入数据库`);
        dispatch(upsertMany(finalProcessedMessages)); // 假设 upsertMany 接受 Message[]
      }
    } catch (err: any) {
      console.error("获取或处理消息时发生严重错误:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      // 出错时，UI 仍显示之前加载的本地消息 (processedLocalMessages)
      // 如果希望出错时清空，可以取消下一行注释
      // setMessages([]);
    } finally {
      setLoading(false); // 无论成功或失败，结束加载状态
    }
  }, [db, dialogId, limit, currentServer, token, dispatch]); // useCallback 依赖项

  // --- Effect to Trigger Fetching ---
  useEffect(() => {
    console.log(`对话 ID 或 limit 变化，触发消息加载: ${dialogId}`);
    fetchMessagesData(); // 初始加载或当依赖变化时重新加载

    // 清理函数：当 dialogId 或 limit 变化导致组件重新渲染或卸载前执行
    return () => {
      console.log(`清理 useMessages effect: ${dialogId}`);
      // 清空状态，避免旧数据残留
      setMessages([]);
      setError(null);
      setLoading(false); // 确保 loading 状态也被重置
      // 注意：这里不需要中止 fetchMessagesData 内部的 Promise，
      // 因为 useCallback 保证了 fetchMessagesData 在依赖不变时是稳定的。
      // 如果依赖变化，会创建新的 fetchMessagesData，旧的执行结果会被新的覆盖。
    };
  }, [dialogId, limit, fetchMessagesData]); // effect 依赖项

  // --- Return Value ---
  return {
    messages, // 当前显示的消息列表
    loading, // 是否正在加载
    error, // 加载过程中发生的错误
    refresh: fetchMessagesData, // 提供手动刷新的方法
  };
};
