// chat/dialog/DialogSideBar.tsx

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal, Dialog } from "render/ui";
import { NorthStarIcon, PlusIcon } from "@primer/octicons-react";
import AI from "ai/blocks/AI";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import CreateCybot from "ai/cybot/CreateCybot";

import { DialogList } from "./DialogList";

const DialogSideBar = ({ dialogList }) => {
  const { t } = useTranslation();
  const [hoveredButton, setHoveredButton] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const theme = useSelector(selectTheme);
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
    padding: theme.sidebarPadding,
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing.medium,
  };

  const getButtonStyle = (buttonId) => ({
    flex: 1,
    fontSize: theme.fontSize.small,
    fontWeight: 500,
    lineHeight: 1.4,
    borderRadius: theme.borderRadius,
    padding: `${theme.spacing.small} ${theme.spacing.medium}`,
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
    gap: theme.spacing.small,
    transition: "all 0.2s ease-in-out",
    outline: "none",
    boxShadow: hoveredButton === buttonId ? `0 0 0 1px ${theme.link}` : "none",
  });

  const buttonTextStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const scrollableContentStyle = {
    flexGrow: 1,
    overflowY: "auto",
    padding: `0 ${theme.sidebarPadding} ${theme.sidebarPadding}`,
  };

  const dialogTitleStyle = {
    fontSize: theme.fontSize.large,
    fontWeight: 600,
    margin: `0 0 ${theme.spacing.large} 0`,
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
          <PlusIcon size={theme.iconSize.small} color={theme.text2} />
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
          <NorthStarIcon size={theme.iconSize.small} color={theme.text2} />
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
