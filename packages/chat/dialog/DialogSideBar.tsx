import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal, Dialog } from "render/ui";
import { NorthStarIcon, PlusIcon } from "@primer/octicons-react";
import AI from "ai/blocks/AI";

import { DialogList } from "./DialogList";
import CreateCybot from "ai/cybot/CreateCybot";

const DialogSideBar = ({ dialogList, theme }) => {
  const { t } = useTranslation();
  const [hoveredButton, setHoveredButton] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
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

  const sidebarContainerStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: theme.surface1,
  };

  const headerBarStyle = {
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
  };

  const getButtonStyle = (buttonId) => ({
    flex: 1,
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: 1.4,
    borderRadius: "6px",
    padding: "8px 12px",
    backgroundColor:
      activeButton === buttonId
        ? theme.surface4
        : hoveredButton === buttonId
          ? theme.surface3
          : theme.surface2,
    color: theme.text1,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "all 0.2s ease-in-out",
    outline: "none",
    boxShadow: hoveredButton === buttonId ? `0 0 0 2px ${theme.link}` : "none",
  });

  const buttonTextStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const scrollableContentStyle = {
    flexGrow: 1,
    overflowY: "auto",
    padding: "0 16px 16px",
  };

  const dialogTitleStyle = {
    fontSize: "18px",
    fontWeight: 600,
    margin: "0 0 15px 0",
    padding: 0,
    lineHeight: 1.4,
    color: theme.text1,
  };

  return (
    <div style={sidebarContainerStyle}>
      <div style={headerBarStyle}>
        <button
          style={getButtonStyle("config")}
          onClick={openConfigModal}
          onMouseEnter={() => setHoveredButton("config")}
          onMouseLeave={() => setHoveredButton(null)}
          onMouseDown={() => setActiveButton("config")}
          onMouseUp={() => setActiveButton(null)}
          onBlur={() => {
            setHoveredButton(null);
            setActiveButton(null);
          }}
        >
          <PlusIcon size={14} color={theme.text2} />
          <span style={buttonTextStyle}>{t("customizeAI")}</span>
        </button>
        <button
          style={getButtonStyle("ais")}
          onClick={openAIsModal}
          onMouseEnter={() => setHoveredButton("ais")}
          onMouseLeave={() => setHoveredButton(null)}
          onMouseDown={() => setActiveButton("ais")}
          onMouseUp={() => setActiveButton(null)}
          onBlur={() => {
            setHoveredButton(null);
            setActiveButton(null);
          }}
        >
          <NorthStarIcon size={14} color={theme.text2} />
          <span style={buttonTextStyle}>{t("newDialog")}</span>
        </button>
      </div>

      <div style={scrollableContentStyle}>
        <DialogList dialogList={dialogList} />
      </div>

      <Dialog
        isOpen={configModalVisible}
        onClose={closeConfigModal}
        title={<h2 style={dialogTitleStyle}>{t("createRobot")}</h2>}
      >
        <CreateCybot onClose={closeConfigModal} />
      </Dialog>

      <Dialog
        isOpen={AIsModalVisible}
        onClose={closeAIsModal}
        title={<h2 style={dialogTitleStyle}>{t("createDialog")}</h2>}
      >
        <AI />
      </Dialog>
    </div>
  );
};

export default DialogSideBar;
