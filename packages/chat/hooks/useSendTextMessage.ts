import { nanoid } from '@reduxjs/toolkit';
import { sendRequestToOpenAI } from 'ai/client/request';
import { useAppDispatch, useAppSelector } from 'app/hooks';

import { receiveMessage, selectChat } from '../chatSlice';
import { Message } from '../types';

export const useSendTextMessage = () => {
  const { currentChatConfig, messages } = useAppSelector(selectChat);
  const dispatch = useAppDispatch();

  const sendTextMessage = async (newContent: Message) => {
    const content = await sendRequestToOpenAI(
      'text',
      {
        userMessage: newContent,
        prevMessages: messages,
      },
      currentChatConfig,
    );
    dispatch(
      receiveMessage({
        role: 'assistant',
        content,
        id: nanoid(),
      }),
    );
  };
  return { sendTextMessage };
};
