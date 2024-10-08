// NewDialogButton.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "render/ui/Dialog";
import { useModal } from "render/ui/Modal";
import { NorthStarIcon } from "@primer/octicons-react";
import AI from "ai/blocks/AI";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

const NewDialogButton = () => {
  const { t } = useTranslation();
  const theme = useSelector(selectTheme);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [activeButton, setActiveButton] = useState(false);
  const {
    visible: AIsModalVisible,
    open: openAIsModal,
    close: closeAIsModal,
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
        onClick={openAIsModal}
        onMouseEnter={() => setHoveredButton(true)}
        onMouseLeave={() => setHoveredButton(false)}
        onMouseDown={() => setActiveButton(true)}
        onMouseUp={() => setActiveButton(false)}
        onBlur={() => {
          setHoveredButton(false);
          setActiveButton(false);
        }}
      >
        <NorthStarIcon size={theme.iconSize.small} color={theme.text2} />
        <span style={buttonTextStyle}>{t("newDialog")}</span>
      </button>

      <Dialog
        isOpen={AIsModalVisible}
        onClose={closeAIsModal}
        title={<h2 style={dialogTitleStyle}>{t("createDialog")}</h2>}
      >
        <AI />
      </Dialog>
    </>
  );
};

export default NewDialogButton;
