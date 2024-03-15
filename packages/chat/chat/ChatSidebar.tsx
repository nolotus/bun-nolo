import CreateChatRobotForm from "ai/blocks/CreateChatRobotForm";
import { useAppDispatch, useAuth } from "app/hooks";
import { useSearchParams, useNavigate } from "react-router-dom";

import { extractUserId } from "core/prefix";
import React from "react";
import { useTranslation } from "react-i18next";
import { useModal, Dialog } from "ui";

import { useDeleteEntryMutation } from "database/services";

import ChatItem from "./ChatItem";
import { removeOne } from "database/dbSlice";

const ChatSidebar = ({ chatList }) => {
  const auth = useAuth();
  const navigate = useNavigate();

  const { t } = useTranslation();

  const {
    visible: configModalVisible,
    open: openConfigModal,
    close: closeConfigModal,
  } = useModal();

  const dispatch = useAppDispatch();

  const [deleteEntry] = useDeleteEntryMutation();

  const deleteChatBot = async (chat) => {
    await deleteEntry({ entryId: chat.id }).unwrap();
    dispatch(removeOne(chat.id));
    navigate("/chat");
  };

  const isCreator = (dataId) => {
    const dataUserId = extractUserId(dataId);
    return dataUserId === auth.user?.userId;
  };
  const [searchParams] = useSearchParams();
  const currentChatId = searchParams.get("chatId");
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
      {chatList?.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          onDeleteChat={deleteChatBot}
          isSelected={currentChatId === chat.id}
          allowEdit={isCreator(chat.id)}
        />
      ))}
    </div>
  );
};

export default ChatSidebar;
