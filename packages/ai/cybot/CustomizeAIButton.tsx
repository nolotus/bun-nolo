// CustomizeAIButton.tsx

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal, Dialog } from "render/ui";
import { PlusIcon } from "@primer/octicons-react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import CreateCybot from "ai/cybot/CreateCybot";

const CustomizeAIButton = () => {
  const { t } = useTranslation();
  const theme = useSelector(selectTheme);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [activeButton, setActiveButton] = useState(false);
  const {
    visible: configModalVisible,
    open: openConfigModal,
    close: closeConfigModal,
  } = useModal();

  const getButtonStyle = () => ({
    flex: 1,
    fontSize: theme.fontSize.small,
    fontWeight: 500,
    lineHeight: 1.4,
    borderRadius: theme.borderRadius,
    padding: `${theme.spacing.small} ${theme.spacing.medium}`,
    backgroundColor: activeButton
      ? theme.surface4
      : hoveredButton
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
    boxShadow: hoveredButton ? `0 0 0 1px ${theme.link}` : "none",
  });

  const buttonTextStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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
    <>
      <button
        style={getButtonStyle()}
        onClick={openConfigModal}
        onMouseEnter={() => setHoveredButton(true)}
        onMouseLeave={() => setHoveredButton(false)}
        onMouseDown={() => setActiveButton(true)}
        onMouseUp={() => setActiveButton(false)}
        onBlur={() => {
          setHoveredButton(false);
          setActiveButton(false);
        }}
      >
        <PlusIcon size={theme.iconSize.small} color={theme.text2} />
        <span style={buttonTextStyle}>{t("customizeAI")}</span>
      </button>

      <Dialog
        isOpen={configModalVisible}
        onClose={closeConfigModal}
        title={<h2 style={dialogTitleStyle}>{t("createRobot")}</h2>}
      >
        <CreateCybot onClose={closeConfigModal} />
      </Dialog>
    </>
  );
};

export default CustomizeAIButton;
