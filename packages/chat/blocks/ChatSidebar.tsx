import ChatConfigForm from 'ai/blocks/ChatConfigForm';
import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { nolotusId } from 'core/init';
import { extractUserId } from 'core/prefix';
import {
  useLazyGetEntriesQuery,
  useLazyGetEntryQuery,
  useDeleteEntryMutation,
} from 'database/service';
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ButtonLink, useModal, Dialog, Alert, useDeleteAlert } from 'ui';

import {
  selectChat,
  setCurrentChatByID,
  fetchchatListSuccess,
  fetchDefaultConfig,
  reloadChatList,
} from '../chatSlice';

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

  const { visible, open, close } = useModal();
  const postReloadChatList = async () => {
    const result = await getChatList({ userId: auth.user?.userId, options });
    isSuccess && dispatch(reloadChatList(result.data));
    // const [nolotusConfigs, userConfigs] = await Promise.all([
    //   queryConfigs(true),
    //   queryConfigs(false, userId),
    // ]);
    // const uniqueConfigs = mergeConfigs(nolotusConfigs, userConfigs);
  };

  const [deleteEntry] = useDeleteEntryMutation();

  const deleteChatBot = async (chat) => {
    await deleteEntry({ entryId: chat.id }).unwrap();
    // 删除成功后的逻辑
    console.log('delete ok');
    postReloadChatList();
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
