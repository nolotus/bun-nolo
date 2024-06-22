import CreateChatRobotForm from "ai/blocks/CreateChatRobotForm";
import { useAuth } from "auth/useAuth";
import { useSearchParams } from "react-router-dom";
import Sizes from "open-props/src/sizes";

import { extractUserId } from "core/prefix";
import React from "react";
import { useTranslation } from "react-i18next";
import { useModal, Dialog } from "render/ui";
import { NorthStarIcon, PlusIcon } from "@primer/octicons-react";
import Fonts from "open-props/src/fonts";
import Borders from "open-props/src/borders";
import AI from "ai/blocks/AI";
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
  const {
    visible: AIsModalVisible,
    open: openAIsModal,
    close: closeAIsModal,
  } = useModal();
  const isCreator = (id) => {
    const dataUserId = extractUserId(id);
    return dataUserId === auth.user?.userId;
  };
  const currentDialogId = searchParams.get("dialogId");

  return (
    <div className="flex flex-col gap-2">
      <div>
        <button
          type="button"
          className="py-0 pl-4"
          onClick={openConfigModal}
          style={{
            fontSize: Fonts["--font-size-1"],
            borderRadius: Borders["--radius-2"],
          }}
        >
          <PlusIcon size={"small"} />
          <span style={{}}>定制你的AI</span>
          <Dialog
            isOpen={configModalVisible}
            onClose={closeConfigModal}
            title={<h2 className="text-xl ">{t("createRobot")}</h2>}
          >
            <CreateChatRobotForm onClose={closeConfigModal} />
          </Dialog>
        </button>
      </div>

      <button
        style={{
          fontSize: Fonts["--font-size-1"],
          borderRadius: Borders["--radius-2"],
          padding: 0,
          paddingLeft: Sizes["--size-1"],
        }}
        onClick={openAIsModal}
      >
        <NorthStarIcon size="small" />
        <span>从AI创建对话</span>
        <Dialog
          isOpen={AIsModalVisible}
          onClose={closeAIsModal}
          title={<h3>{t("createDialog")}</h3>}
        >
          <AI />
        </Dialog>
      </button>

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
