// render/ui/Alert.tsx

import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "render/ui/Button";
import { Modal, useModal } from "./Modal";
import { styles } from "render/ui/styles";
import { selectTheme } from "app/theme/themeSlice";
import { useMediaQuery } from "react-responsive";

// 自定义 hook 用于响应式样式
const useResponsiveStyles = () => {
  const theme = useSelector(selectTheme);

  const isLarge = useMediaQuery({ minWidth: theme.breakpoints[3] });
  const isMedium = useMediaQuery({
    minWidth: theme.breakpoints[2],
    maxWidth: theme.breakpoints[3] - 1,
  });

  return {
    padding: isLarge ? "2.5rem" : isMedium ? "2rem" : "1.5rem",
    titleSize: isLarge ? "24px" : isMedium ? "22px" : "20px",
    messageSize: isLarge ? "16px" : isMedium ? "15px" : "14px",
    buttonPadding: isLarge
      ? "0.75rem 2rem"
      : isMedium
        ? "0.75rem 1.5rem"
        : "0.5rem 1rem",
    buttonMinWidth: isLarge ? "120px" : isMedium ? "110px" : "100px",
  };
};

export const useDeleteAlert = (deleteCallback: (item: any) => void) => {
  const { visible, open, close, modalState } = useModal();

  const confirmDelete = (item: any) => {
    open(item);
  };

  const doDelete = () => {
    deleteCallback(modalState);
    close();
  };

  return { visible, confirmDelete, doDelete, closeAlert: close, modalState };
};

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const Alert: React.FC<AlertProps> = React.memo(
  ({ isOpen, onClose, onConfirm, message, title }) => {
    const theme = useSelector(selectTheme);
    const responsiveStyles = useResponsiveStyles();
    const { t } = useTranslation();

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div
          style={{
            ...styles.rounded,
            backgroundColor: theme.surface1,
            padding: responsiveStyles.padding,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: responsiveStyles.titleSize,
              fontWeight: 600,
              marginBottom: "1.5rem",
              color: theme.text1,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              color: theme.text1,
              marginBottom: "2rem",
              maxWidth: "80%",
              lineHeight: "1.5",
              fontSize: responsiveStyles.messageSize,
            }}
          >
            {message}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              width: "100%",
            }}
          >
            <Button
              onClick={onClose}
              style={{
                minWidth: responsiveStyles.buttonMinWidth,
                padding: responsiveStyles.buttonPadding,
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={onConfirm}
              style={{
                minWidth: responsiveStyles.buttonMinWidth,
                padding: responsiveStyles.buttonPadding,
              }}
            >
              {t("confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    );
  },
);

export default Alert;
