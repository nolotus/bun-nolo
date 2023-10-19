// useStreamHandler.ts
import {useState} from 'react';
import {getLogger} from 'utils/logger';
import {getUser} from 'auth/client/token';
import {tokenStatic} from 'ai/client/static';
import {sendRequestToOpenAI} from 'ai/client/request';

const chatWindowLogger = getLogger('ChatWindow'); // 初始化日志

export const useStreamHandler = (config, setMessages) => {
  const {username, userId} = getUser();
  const [tempMessages, setTempMessages] = useState({
    role: 'assistant',
    id: '',
    content: '',
  });
  const [isStopped, setIsStopped] = useState(false);

  let temp;
  let tokenCount = 0;
  const handleStreamData = data => {
    const text = new TextDecoder('utf-8').decode(data);
    const lines = text.trim().split('\n');
    lines.forEach(line => {
      // 使用正则表达式匹配 "data:" 后面的内容
      const match = line.match(/data: (done|{.*}|)/);

      if (match && match[1] !== undefined) {
        const statusOrJson = match[1];
        if (statusOrJson === '') {
          chatWindowLogger.info('Received gap (empty string)');
        } else if (statusOrJson === 'done') {
          chatWindowLogger.info('Received done');
        } else {
          try {
            const json = JSON.parse(statusOrJson);
            // 自然停止
            if (json.choices[0].finish_reason === 'stop') {
              setMessages(prevMessages => {
                console.log('tempMessages', tempMessages);
                return [...prevMessages, {role: 'assistant', content: temp}];
              });
              setTempMessages({role: '', id: '', content: ''});
              const staticData = {
                dialogType: 'receive',
                model: json.model,
                length: tokenCount,
                chatId: json.id,
                chatCreated: json.created,
                userId,
                username,
              };
              tokenStatic(staticData);
              tokenCount = 0; // 重置计数器
            } else if (json.choices[0].finish_reason === 'length') {
              setIsStopped(true);
            } else if (json.choices[0].finish_reason === 'content_filter') {
              setIsStopped(true);
            } else if (json.choices[0].finish_reason === 'function_call') {
              // nerver use just sign it
            } else {
              temp = (temp || '') + (json.choices[0]?.delta?.content || '');

              setTempMessages({role: 'assistant', id: json.id, content: temp});
            }
            if (json.choices[0]?.delta?.content) {
              tokenCount++; // 单次计数
            }
          } catch (e) {
            chatWindowLogger.error({error: e}, 'Error parsing JSON');
          }
        }
      }
    });
  };

  const handleStreamMessage = async (newMessage, prevMessages) => {
    await sendRequestToOpenAI(
      'stream',
      {
        userMessage: newMessage,
        prevMessages: prevMessages,
      },
      config,
      handleStreamData, // 传递回调函数
    );
  };
  const clearMessages = () => {
    setMessages([]);
    setTempMessages({role: 'assistant', id: '', content: ''});
  };

  return {
    tempMessages,
    handleStreamMessage,
    clearMessages,
    isStopped,
    setIsStopped,
    setTempMessages,
  };
};
