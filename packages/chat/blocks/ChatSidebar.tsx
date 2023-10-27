import React, { useEffect } from "react";
import { ButtonLink, useModal, Dialog, Alert, useDeleteAlert } from "ui";
import ChatConfigForm from "ai/blocks/ChatConfigForm";
import { useSearchParams } from "react-router-dom";
import { nolotusId } from "core/init";

import { extractUserId } from "core/prefix";
import { deleteData } from "database/client/delete";
import { useAppDispatch, useAppSelector, useAuth } from "app/hooks";
import {
  useGetEntriesQuery,
  useLazyGetEntriesQuery,
  useLazyGetEntryQuery,
} from "app/services/database";

import {
  selectChat,
  setCurrentChatByID,
  fetchNolotuschatListSuccess,
  fetchDefaultConfig,
} from "../chatSlice";

const ChatSidebar = () => {
  const dispatch = useAppDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const [getDefaultConfig, { data, isSuccess: readOk }] =
    useLazyGetEntryQuery();

  const chatList = useAppSelector((state) => state.chat.chatList);
  const options = {
    isJSON: true,
    condition: {
      $eq: { type: "chatRobot" },
    },
    limit: 20,
  };
  const [
    getNolotusChatList,
    { data: nolotusChatRobots, isLoading, isSuccess },
  ] = useLazyGetEntriesQuery();

  useEffect(() => {
    getNolotusChatList({ userId: nolotusId, options });
    isSuccess && dispatch(fetchNolotuschatListSuccess(nolotusChatRobots));
  }, [isSuccess]);
  const chatId = searchParams.get("chatId");

  useEffect(() => {
    chatId && getDefaultConfig(chatId);
    readOk && dispatch(fetchDefaultConfig(data));
  }, [chatId]);

  const { currentChatConfig } = useAppSelector(selectChat);

  const handleChatSelect = (chat) => {
    dispatch(setCurrentChatByID(chat.id));
    setSearchParams({ ...searchParams, chatId: currentChatConfig?.id });
  };

  const selectedChat = currentChatConfig?.id;

  const { visible, open, close } = useModal();
  const reloadChatList = async () => {
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
  const auth = useAuth();
  const allowEdit = dataUserId === auth.user?.userId;

  return (
    <div className="flex flex-col h-full justify-start bg-gray-100">
      <div className="p-4">
        <ButtonLink to="/create/chatRobot" className="text-blue-400">
          定制你的专属智能机器
        </ButtonLink>
      </div>
      {isLoading ? (
        "loading"
      ) : (
        <>
          {chatList.map((chat, index) => (
            <div
              key={index}
              className={`flex items-center p-4 cursor-pointer group ${
                selectedChat === chat.id ? "bg-gray-200" : "hover:bg-gray-200"
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
