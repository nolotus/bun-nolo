import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { nolotusId } from 'core/init';
import { extractUserId } from 'core/prefix';
import {
  useLazyGetEntriesQuery,
  useLazyGetEntryQuery,
  useDeleteEntryMutation,
} from 'database/services';
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ButtonLink } from 'ui';

import {
  selectChat,
  setCurrentChatByID,
  fetchchatListSuccess,
  fetchDefaultConfig,
  reloadChatList,
} from '../chatSlice';

import ChatItem from './ChatItem';
const options = {
  isJSON: true,
  condition: {
    $eq: { type: 'chatRobot' },
  },
  limit: 20,
};
const ChatSidebar = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const chatId = searchParams.get('chatId');

  const auth = useAuth();
  const dispatch = useAppDispatch();
  const { currentChatConfig } = useAppSelector(selectChat);

  const [getDefaultConfig] = useLazyGetEntryQuery();

  useEffect(() => {
    const requestDefaultConfig = async () => {
      const chatIdConfig = await getDefaultConfig(chatId);
      console.log('chatIdConfig', chatIdConfig);
      if (chatIdConfig.error?.status === 404) {
        navigate('/chat');
      }
      chatIdConfig.data && dispatch(fetchDefaultConfig(chatIdConfig.data));
    };
    console.log('chatId', chatId);
    chatId && requestDefaultConfig();
  }, [chatId, dispatch, getDefaultConfig, navigate]);

  const chatList = useAppSelector((state) => state.chat.chatList);

  const [getChatList, { isLoading, isSuccess }] = useLazyGetEntriesQuery();

  useEffect(() => {
    const fetchChatList = async () => {
      const nolotusChatList = await getChatList({ userId: nolotusId, options });
      isSuccess && dispatch(fetchchatListSuccess(nolotusChatList.data));

      if (auth.user?.userId) {
        const userChatList = await getChatList({
          userId: auth.user?.userId,
          options,
        });
        console.log('userChatList', userChatList.data);
        isSuccess && dispatch(fetchchatListSuccess(userChatList.data));
      }
    };
    fetchChatList();
  }, [isSuccess, auth.user?.userId, dispatch, getChatList]);

  const handleChatSelect = (chat) => {
    dispatch(setCurrentChatByID(chat.id));
    setSearchParams({ ...searchParams, chatId: chat.id });
  };

  const selectedChat = currentChatConfig?.id;

  const postReloadChatList = async () => {
    const result = await getChatList({ userId: auth.user?.userId, options });
    isSuccess && dispatch(reloadChatList(result.data));
  };

  const [deleteEntry] = useDeleteEntryMutation();

  const deleteChatBot = async (chat) => {
    await deleteEntry({ entryId: chat.id }).unwrap();
    // 删除成功后的逻辑
    console.log('delete ok');
    postReloadChatList();
  };

  const dataUserId = selectedChat && extractUserId(selectedChat);
  const allowEdit = dataUserId === auth.user?.userId;

  return (
    <div className="flex flex-col h-full justify-start bg-gray-100">
      <div className="p-4">
        <ButtonLink to="/create/chatRobot" className="text-blue-400">
          定制你的专属智能机器
        </ButtonLink>
      </div>
      {isLoading ? (
        'loading'
      ) : (
        <>
          {chatList.map((chat, index) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              onChatSelect={handleChatSelect}
              onDeleteChat={deleteChatBot}
              isSelected={selectedChat === chat.id}
              allowEdit={
                allowEdit && extractUserId(chat.id) === auth.user?.userId
              }
            />
          ))}
        </>
      )}
    </div>
  );
};

export default ChatSidebar;
