import aiTranslations from 'ai/aiI18n';
import { useAppDispatch } from 'app/hooks';
import { nolotusId } from 'core/init';
import { updateData } from 'database/dbSlice';
import { useLazyGetEntriesQuery } from 'database/services';
import i18n from 'i18n';
import React, { useEffect } from 'react';

import chatTranslations from '../chatI18n';

import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

Object.keys(chatTranslations).forEach((lang) => {
  const translations = chatTranslations[lang].translation;
  i18n.addResourceBundle(lang, 'translation', translations, true, true);
});
Object.keys(aiTranslations).forEach((lang) => {
  const translations = aiTranslations[lang].translation;
  i18n.addResourceBundle(lang, 'translation', translations, true, true);
});

const ChatPage = () => {
  const [getChatList, { isLoading, isSuccess }] = useLazyGetEntriesQuery();
  const fetchChatList = async () => {
    const options = {
      isJSON: true,
      condition: {
        $eq: { type: 'tokenStatistics' },
      },
      limit: 10000,
    };

    const defaultTokenStatisticsList = await getChatList({
      userId: nolotusId,
      options,
    }).unwrap();
    const nolotusTokenStatisticsList = await getChatList({
      userId: nolotusId,
      options,
      domain: 'https://nolotus.com',
    }).unwrap();
    console.log('defaultTokenStatisticsList', defaultTokenStatisticsList);

    dispatch(updateData({ data: defaultTokenStatisticsList }));
    console.log('nolotusTokenStatisticsList', nolotusTokenStatisticsList);

    dispatch(updateData({ data: nolotusTokenStatisticsList }));
  };
  useEffect(() => {
    fetchChatList();
  }, []);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-60px)]">
      {/* Config Panel and Toggle Button */}
      <div className="hidden lg:block lg:w-1/6 bg-gray-200 overflow-y-auto">
        <ChatSidebar />
      </div>

      {/* Chat Window */}
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
