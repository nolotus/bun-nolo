import React from "react";
import { ButtonLink, useModal, Dialog, Alert, useDeleteAlert } from "ui";
import ChatConfigForm from "ai/blocks/ChatConfigForm";

import { extractUserId } from "core/prefix";
import { getUserId } from "auth/client/token";
import { deleteData } from "database/client/delete";

const ChatSidebar = ({
  chatList,
  selectedChat,
  handleChatSelect,
  reloadChatList,
}) => {
  const { visible, open, close } = useModal();
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
  const userId = getUserId();

  const allowEdit = dataUserId === userId;

  return (
    <div className="flex flex-col h-full justify-start bg-gray-100">
      <div className="p-4">
        <ButtonLink to="/create/chatRobot" className="text-blue-400">
          定制你的专属智能机器
        </ButtonLink>
      </div>
      <div>
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
              </div>
            )}
          </div>
        ))}
      </div>
      <Dialog isOpen={visible} onClose={close}>
        {selectedChat ? (
          <ChatConfigForm id={selectedChat} onClose={close} />
        ) : (
          <div className="text-gray-600">Loading or no chat selected</div>
        )}
      </Dialog>
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
  );
};

export default ChatSidebar;
