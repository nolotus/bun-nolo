import CreateChatRobotForm from "ai/blocks/CreateChatRobotForm";
import { useAuth } from "auth/useAuth";
import { NavLink, useSearchParams } from "react-router-dom";

import { extractUserId } from "core/prefix";
import React from "react";
import { useTranslation } from "react-i18next";
import { useModal, Dialog } from "ui";

import { DialogItem } from "./DialogItem";
import { NorthStarIcon, PlusIcon } from "@primer/octicons-react";
import Fonts from "open-props/src/fonts";

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
    <div className="flex flex-col gap-1">
      <div className="flex ">
        <button className="mr-6" type="button" onClick={openConfigModal}>
          <PlusIcon size={"small"} />
          <span>AI</span>
          <Dialog
            isOpen={configModalVisible}
            onClose={closeConfigModal}
            title={<h2 className="text-xl ">{t("createRobot")}</h2>}
          >
            <CreateChatRobotForm onClose={closeConfigModal} />
          </Dialog>
        </button>
      </div>
      <NavLink to={"/ais"}>
        <button>
          <NorthStarIcon />
          <span>发现</span>
        </button>
      </NavLink>
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
