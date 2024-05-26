import CreateChatRobotForm from "ai/blocks/CreateChatRobotForm";
import { useAuth } from "auth/useAuth";
import { useSearchParams } from "react-router-dom";
import Sizes from "open-props/src/sizes";

import { extractUserId } from "core/prefix";
import React from "react";
import { useTranslation } from "react-i18next";
import { useModal, Dialog } from "ui";

import { DialogItem } from "./DialogItem";
const DialogSideBar = ({ dialogList }) => {
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const { t } = useTranslation();

  const {
    visible: configModalVisible,
    open: openConfigModal,
    close: closeConfigModal,
  } = useModal();

  const isCreator = (id) => {
    const dataUserId = extractUserId(id);
    return dataUserId === auth.user?.userId;
  };
  const currentDialogId = searchParams.get("dialogId");

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <button type="button" onClick={openConfigModal}>
          创建智能助理
          <Dialog
            isOpen={configModalVisible}
            onClose={closeConfigModal}
            title={<h2 className="text-xl ">{t("createRobot")}</h2>}
          >
            <CreateChatRobotForm onClose={closeConfigModal} />
          </Dialog>
        </button>
      </div>

      {dialogList?.map((dialog) => (
        <DialogItem
          key={dialog.id}
          dialog={dialog}
          isSelected={currentDialogId === dialog.id}
          allowEdit={isCreator(dialog.id)}
        />
      ))}
    </div>
  );
};

export default DialogSideBar;
