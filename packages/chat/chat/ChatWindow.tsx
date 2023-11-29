import { TrashIcon } from '@primer/octicons-react';
import { nanoid } from '@reduxjs/toolkit';
import { tokenStatic } from 'ai/client/static';
import { selectCostByUserId } from 'ai/selectors';
import { useGenerateImageMutation } from 'ai/services';
import { ModeType } from 'ai/types';
import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { useWriteHashMutation } from 'database/services';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui';
import { getLogger } from 'utils/logger';

import {
  receiveMessage,
  sendMessage,
  selectChat,
  retry,
  clearMessages,
  continueMessage,
  messageEnd,
} from '../chatSlice';
import MessageInput from '../messages/MessageInput';
import MessagesDisplay from '../messages/MessagesDisplay';
import { useStreamHandler } from '../useStreamHandler';

const chatWindowLogger = getLogger('ChatWindow'); // 初始化日志

const ChatWindow = () => {
  const auth = useAuth();
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const messages = useAppSelector((state) => state.chat.messages);
  const [generateImage, { isLoading: isGeneratingImage }] =
    useGenerateImageMutation();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };
  const [requestFailed, setRequestFailed] = useState(false);
  const { currentChatConfig, isStopped, isMessageStreaming } =
    useAppSelector(selectChat);
  const [writeHashData] = useWriteHashMutation();

  const { handleStreamMessage, onCancel } = useStreamHandler(
    currentChatConfig,
    auth.user?.userId,
    auth.user?.username,
  );

  const handleSendMessage = async (newContent) => {
    if (!newContent.trim()) {
      return;
    }

    let mode: ModeType = 'stream';
    const generateImagePattern = /生成.*图片/;
    if (
      generateImagePattern.test(newContent) ||
      newContent.includes('生成图片')
    ) {
      mode = 'image';
    }

    setRequestFailed(false);
    dispatch(sendMessage({ role: 'user', content: newContent, id: nanoid() }));
    try {
      if (mode === 'image') {
        const response = await generateImage({
          prompt: newContent,
        }).unwrap();
        console.log('response', response);
        const data = response.data;
        const imageUrl = data.data[0].url; // 提取图片 URL
        console.log('imageUrl', imageUrl);
        dispatch(
          receiveMessage({
            role: 'assistant',
            content: 'Here is your generated image:',
            image: imageUrl, // 使用提取出的图片 URL
          }),
        );
      }
      if (mode === 'stream') {
        await handleStreamMessage(newContent, messages);
        const staticData = {
          dialogType: 'send',
          model: currentChatConfig?.model,
          length: newContent.length,
          userIdL: auth?.user?.userId,
          username: auth?.user?.username,
          date: new Date(),
        };
        tokenStatic(staticData, auth, writeHashData);
      }
    } catch (error) {
      chatWindowLogger.error({ error }, 'Error while sending message');
      setRequestFailed(true);
    } finally {
      dispatch(messageEnd());
    }
  };
  const handleRetry = async () => {
    const lastMessage = messages[messages.length - 1];
    dispatch(retry());
    // 使用 handleSendMessage 重新发送最后一条消息
    if (lastMessage && lastMessage.role === 'user') {
      await handleSendMessage(lastMessage.content);
    }
  };
  const handleContinue = async () => {
    // 移除第一条消息
    const newMessages = messages.slice(1);
    dispatch(continueMessage(newMessages));

    // 发送新的请求
    if (newMessages.length > 0) {
      const lastUserMessage = newMessages[newMessages.length - 1].content;
      if (lastUserMessage) {
        await handleStreamMessage(lastUserMessage, newMessages);
      }
    }
  };
  const userCost = useAppSelector(selectCostByUserId);
  // const allowSend = Number(userCost.totalCost) < 2;
  const allowSend = true;
  return (
    <div className="w-full lg:w-5/6 flex flex-col h-full">
      <MessagesDisplay messages={messages} scrollToBottom={scrollToBottom} />
      {allowSend ? (
        <div className="p-4 flex items-center">
          <div className="flex-grow">
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isMessageStreaming}
              onCancel={onCancel}
            />
          </div>
          <div className="ml-2 flex space-x-2">
            <Button
              onClick={() => dispatch(clearMessages())}
              icon={<TrashIcon size={16} />} // 使用 TrashIcon 并设置合适的尺寸
              className="text-sm p-1"
            >
              {t('clearChat')}
            </Button>
            {requestFailed && (
              <Button onClick={handleRetry} className="text-sm p-1">
                重试
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div>欠费大于10元，请在你的个人中心查看付费，点击你的名字</div>
      )}

      {isStopped && <Button onClick={handleContinue}>继续</Button>}
    </div>
  );
};
export default ChatWindow;
