// useStreamHandler.ts
import { tokenStatic } from 'ai/client/static';
import { useStreamChatMutation } from 'ai/services';
import { useAppDispatch, useAuth } from 'app/hooks';
import { useWriteHashMutation } from 'database/services';
import { useRef } from 'react';
import { getLogger } from 'utils/logger';

import {
  messageStreamEnd,
  messageStreaming,
  messagesReachedMax,
} from './chatSlice';
const chatWindowLogger = getLogger('ChatWindow'); // 初始化日志

export const useStreamHandler = (config, userId, username) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const [writeHashData] = useWriteHashMutation();
  const [streamChat] = useStreamChatMutation();
  let temp;
  let tokenCount = 0;
  const activeStream = useRef(null);
  const handleStreamData = (data) => {
    const text = new TextDecoder('utf-8').decode(data);
    const lines = text.trim().split('\n');
    lines.forEach((line) => {
      // 使用正则表达式匹配 "data:" 后面的内容
      const match = line.match(/data: (done|{.*}|)/);

      if (match && match[1] !== undefined) {
        const statusOrJson = match[1];
        if (statusOrJson === '' || statusOrJson === 'done') {
          chatWindowLogger.info(
            statusOrJson === ''
              ? 'Received gap (empty string)'
              : 'Received done',
          );
        } else {
          try {
            const json = JSON.parse(statusOrJson);
            // 自然停止
            const finishReason = json.choices[0].finish_reason;
            if (finishReason === 'stop') {
              dispatch(messageStreamEnd({ role: 'assistant', content: temp }));
              const staticData = {
                dialogType: 'receive',
                model: json.model,
                length: tokenCount,
                chatId: json.id,
                chatCreated: json.created,
                userId,
                username,
              };
              tokenStatic(staticData, auth, writeHashData);

              tokenCount = 0; // 重置计数器
            } else if (
              finishReason === 'length' ||
              finishReason === 'content_filter'
            ) {
              dispatch(messagesReachedMax());
            } else if (finishReason === 'function_call') {
              // nerver use just sign it
            } else {
              temp = (temp || '') + (json.choices[0]?.delta?.content || '');
              dispatch(
                messageStreaming({
                  role: 'assistant',
                  id: json.id,
                  content: temp,
                }),
              );
            }
            if (json.choices[0]?.delta?.content) {
              tokenCount++; // 单次计数
            }
          } catch (e) {
            chatWindowLogger.error({ error: e }, 'Error parsing JSON');
          }
        }
      }
    });
  };
  const handleStreamMessage = async (newMessage, prevMessages) => {
    const controller = new AbortController();
    await streamChat({
      payload: {
        userMessage: newMessage,
        prevMessages: prevMessages,
      },
      config,
      onStreamData: handleStreamData,
      signal: controller.signal,
    });
    activeStream.current = controller;
  };
  const onCancel = () => {
    if (activeStream.current) {
      console.log('cancel activeStream', activeStream);
      activeStream.current.abort();
      activeStream.current = null;
    }
  };

  return {
    handleStreamMessage,
    onCancel,
  };
};
