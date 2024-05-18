import CreateChatRobotForm from "ai/blocks/CreateChatRobotForm";
import { useAuth } from "app/hooks";
import { useSearchParams } from "react-router-dom";

import { extractUserId } from "core/prefix";
import React from "react";
import { useTranslation } from "react-i18next";
import { useModal, Dialog } from "ui";

import { DialogItem } from "./DialogItem";
const DialogSideBar = ({ dialogList }) => {
  const auth = useAuth();

  const { t } = useTranslation();

  const {
    visible: configModalVisible,
    open: openConfigModal,
    close: closeConfigModal,
  } = useModal();

  const isCreator = (noloId) => {
    const dataUserId = extractUserId(noloId);
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

      {dialogList?.map((dialog) => (
        <DialogItem
          key={dialog.id}
          dialog={dialog}
          isSelected={currentChatId === dialog.id}
          allowEdit={isCreator(dialog.id)}
        />
      ))}
    </div>
  );
};

export default DialogSideBar;