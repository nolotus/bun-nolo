import CreateChatRobotForm from 'ai/blocks/CreateChatRobotForm'; // Import the form component
import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { nolotusId } from 'core/init';
import { extractUserId } from 'core/prefix';
import { useLazyGetEntriesQuery } from 'database/services';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useModal, Dialog } from 'ui';

import {
  selectChat,
  setCurrentChatByID,
  fetchchatListSuccess,
  reloadChatList,
} from '../chatSlice';
import useChatId from '../hooks/useChatId';
import { useDefaultConfig } from '../hooks/useDefaultConfig';
import { useDeleteChat } from '../hooks/useDeleteChat';

import ChatItem from './ChatItem';
const options = {
  isJSON: true,
  condition: {
    $eq: { type: 'chatRobot' },
  },
  limit: 20,
};
const ChatSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const chatId = useChatId();

  useDefaultConfig(chatId);

  const {
    visible: configModalVisible,
    open: openConfigModal,
    close: closeConfigModal,
  } = useModal();

  const auth = useAuth();
  const dispatch = useAppDispatch();
  const { currentChatConfig } = useAppSelector(selectChat);

  const chatList = useAppSelector((state) => state.chat.chatList);
  const chatItems = chatList.ids.map((id) => chatList.entities[id]);

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
        isSuccess && dispatch(fetchchatListSuccess(userChatList.data));
      }
    };
    fetchChatList();
  }, [isSuccess, auth.user?.userId, dispatch, getChatList]);

  const handleChatSelect = (chat) => {
    console.log('chat', chat);
    dispatch(setCurrentChatByID(chat.id));
    setSearchParams({ ...searchParams, chatId: chat.id });
  };

  const selectedChat = currentChatConfig?.id;

  const postReloadChatList = async () => {
    const result = await getChatList({ userId: auth.user?.userId, options });
    isSuccess && dispatch(reloadChatList(result.data));
  };

  const deleteChatBot = useDeleteChat(postReloadChatList);

  const dataUserId = selectedChat && extractUserId(selectedChat);
  const allowEdit = dataUserId === auth.user?.userId;

  return (
    <div className="flex flex-col h-full justify-start bg-gray-100">
      <div className="p-4">
        <button onClick={openConfigModal} className="text-blue-400">
          创建智能助理
        </button>
      </div>
      <Dialog isOpen={configModalVisible} onClose={closeConfigModal}>
        <CreateChatRobotForm onClose={closeConfigModal} />
      </Dialog>
      {isLoading ? (
        'loading'
      ) : (
        <>
          {chatItems.map((chat) => (
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
