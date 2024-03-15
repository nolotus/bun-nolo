import CreateChatRobotForm from "ai/blocks/CreateChatRobotForm";
import { useAppDispatch, useAppSelector, useAuth } from "app/hooks";
import { extractUserId } from "core/prefix";
import {
  useLazyGetEntriesQuery,
  useLazyGetEntryQuery,
} from "database/services";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useModal, Dialog } from "ui";

import { fetchDefaultConfig, selectChat, reloadChatList } from "../chatSlice";
import { useDeleteChat } from "../hooks/useDeleteChat";

import ChatItem from "./ChatItem";

const ChatSidebar = () => {
  const { t } = useTranslation();
  const [getDefaultConfig] = useLazyGetEntryQuery();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chatId");

  const {
    visible: configModalVisible,
    open: openConfigModal,
    close: closeConfigModal,
  } = useModal();

  const auth = useAuth();
  const dispatch = useAppDispatch();
  const { currentChatId } = useAppSelector(selectChat);

  const chatList = useAppSelector((state) => state.chat.chatList);
  const chatItems = chatList.ids.map((id) => chatList.entities[id]);

  const [getentries, { isLoading, isSuccess }] = useLazyGetEntriesQuery();

  useEffect(() => {
    const requestDefaultConfig = async () => {
      if (chatId) {
        const chatIdConfig = await getDefaultConfig({
          entryId: chatId,
        }).unwrap();
        if (chatIdConfig.error?.status === 404) {
          navigate("/chat");
        } else {
          dispatch(fetchDefaultConfig(chatIdConfig));
        }
      }
    };
    requestDefaultConfig();
  }, [chatId, dispatch, getDefaultConfig, navigate]);

  const postReloadChatList = async () => {
    const result = await getentries({ userId: auth.user?.userId, options });
    console.log("postReloadChatList result", result);
    isSuccess && dispatch(reloadChatList(result.data));
  };

  const deleteChatBot = useDeleteChat(postReloadChatList);

  const isCreator = (dataId) => {
    const dataUserId = extractUserId(dataId);
    return dataUserId === auth.user?.userId;
  };
  return (
    <div className="flex h-full flex-col justify-start bg-gray-100">
      <div className="p-4">
        <button
          type="button"
          onClick={openConfigModal}
          className="text-blue-400"
        >
          创建智能助理
        </button>
      </div>
      <Dialog
        isOpen={configModalVisible}
        onClose={closeConfigModal}
        title={<h2 className="text-xl font-bold">{t("createRobot")}</h2>}
      >
        <CreateChatRobotForm onClose={closeConfigModal} />
      </Dialog>
      {isLoading ? (
        "loading"
      ) : (
        <>
          {chatItems?.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              onDeleteChat={deleteChatBot}
              isSelected={currentChatId === chat.id}
              allowEdit={isCreator(chat.id)}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default ChatSidebar;
