import React from "react";
import { useTranslation } from "react-i18next";
import { useModal, Dialog, Button } from "render/ui";
import { NorthStarIcon, PlusIcon } from "@primer/octicons-react";
import Fonts from "open-props/src/fonts";
import Borders from "open-props/src/borders";
import AI from "ai/blocks/AI";
import OpenProps from "open-props";

import { DialogList } from "./DialogList";
import { ChatSidebarPadding, ChatSidebarWidth } from "../styles";
import CreateCybot from "ai/cybot/CreateCybot";

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
      style={{
        display: "flex",
        flexDirection: "column",
        gap: OpenProps.size2,
        overflowY: "auto",
        padding: ChatSidebarPadding,
        width: ChatSidebarWidth,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: OpenProps.size2,
        }}
      >
        <button
          type="button"
          onClick={openConfigModal}
          style={{
            fontSize: Fonts["--font-size-1"],
            borderRadius: Borders["--radius-2"],
            padding: OpenProps.size2,
          }}
        >
          <PlusIcon />
          定制你的AI
          <Dialog
            isOpen={configModalVisible}
            onClose={closeConfigModal}
            title={<h2 className="text-xl ">{t("createRobot")}</h2>}
          >
            <CreateCybot onClose={closeConfigModal} />
          </Dialog>
        </button>

        <button
          style={{
            padding: OpenProps.size2,
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
      </div>
      <DialogList dialogList={dialogList} />
    </div>
  );
};

export default DialogSideBar;
