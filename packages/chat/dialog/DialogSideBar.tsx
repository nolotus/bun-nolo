import CreateChatRobotForm from "ai/blocks/CreateChatRobotForm";
import Sizes from "open-props/src/sizes";

import React from "react";
import { useTranslation } from "react-i18next";
import { useModal, Dialog } from "render/ui";
import { NorthStarIcon, PlusIcon } from "@primer/octicons-react";
import Fonts from "open-props/src/fonts";
import Borders from "open-props/src/borders";
import AI from "ai/blocks/AI";

import { DialogList } from "./DialogList";
import { ChatSidebarPadding, ChatSidebarWidth } from "../styles";

const DialogSideBar = ({ dialogList }) => {
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

  return (
    <div
      className="overflow-y-auto "
      style={{
        padding: ChatSidebarPadding,
        width: ChatSidebarWidth,
      }}
    >
      <div className="gap-2">
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
        <DialogList dialogList={dialogList} />
      </div>
    </div>
  );
};

export default DialogSideBar;
