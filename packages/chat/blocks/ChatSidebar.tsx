import ChatConfigForm from 'ai/blocks/ChatConfigForm';
import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import {
  useLazyGetEntriesQuery,
  useLazyGetEntryQuery,
} from 'app/services/database';
import { nolotusId } from 'core/init';
import { extractUserId } from 'core/prefix';
import { deleteData } from 'database/client/delete';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonLink, useModal, Dialog, Alert, useDeleteAlert } from 'ui';

import {
  selectChat,
  setCurrentChatByID,
  fetchchatListSuccess,
  fetchDefaultConfig,
} from '../chatSlice';

const ChatSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const chatId = searchParams.get('chatId');

  const auth = useAuth();
  const dispatch = useAppDispatch();
  const { currentChatConfig } = useAppSelector(selectChat);

  const [getDefaultConfig, { data, isSuccess: readOk }] =
    useLazyGetEntryQuery();

  useEffect(() => {
    chatId && getDefaultConfig(chatId);
    readOk && dispatch(fetchDefaultConfig(data));
  }, [chatId, readOk, data, dispatch, getDefaultConfig]);

  const chatList = useAppSelector((state) => state.chat.chatList);

  const [getChatList, { data: nolotusChatRobots, isLoading, isSuccess }] =
    useLazyGetEntriesQuery();

  useEffect(() => {
    const options = {
      isJSON: true,
      condition: {
        $eq: { type: 'chatRobot' },
      },
      limit: 20,
    };
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
    setSearchParams({ ...searchParams, chatId: currentChatConfig?.id });
  };

  const selectedChat = currentChatConfig?.id;

  const { visible, open, close } = useModal();
  const reloadChatList = async () => {
    getChatList({ userId: auth.user?.userId, options });
    isSuccess && dispatch(fetchchatListSuccess(nolotusChatRobots));
    // const [nolotusConfigs, userConfigs] = await Promise.all([
    //   queryConfigs(true),
    //   queryConfigs(false, userId),
    // ]);
    // const uniqueConfigs = mergeConfigs(nolotusConfigs, userConfigs);
  };
  const deleteChatBot = async (chat) => {
    await deleteData(chat.id);
    reloadChatList();
  };
  const {
    visible: alertVisible,
    confirmDelete,
    doDelete,
    closeAlert,
    modalState,
  } = useDeleteAlert((chat) => {
    deleteChatBot(chat);
  });
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
            <div
              key={index}
              className={`flex items-center p-4 cursor-pointer group ${
                selectedChat === chat.id ? 'bg-gray-200' : 'hover:bg-gray-200'
              }`}
              onClick={() => handleChatSelect(chat)}
            >
              <span className="text-gray-600">{chat.name}</span>
              {allowEdit && (
                <div className="opacity-0 group-hover:opacity-100 ml-auto">
                  <button className="text-blue-400" onClick={() => open(chat)}>
                    edit
                  </button>
                  <Dialog isOpen={visible} onClose={close}>
                    {visible && (
                      <ChatConfigForm initialValues={chat} onClose={close} />
                    )}
                  </Dialog>
                </div>
              )}
              {allowEdit && (
                <div className="opacity-0 group-hover:opacity-100 ml-auto">
                  <button
                    className="text-blue-400"
                    onClick={() => confirmDelete(chat)}
                  >
                    删除
                  </button>
                  {alertVisible && (
                    <Alert
                      isOpen={alertVisible}
                      onClose={closeAlert}
                      onConfirm={doDelete}
                      title={`删除 ${modalState.name}`}
                      message={`你确定要删除 ${modalState.name} 吗？`}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ChatSidebar;
