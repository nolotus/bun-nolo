import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "render/ui/Dialog";
import { useModal } from "render/ui/Modal";
import { PlusIcon } from "@primer/octicons-react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import Button from "render/ui/Button";
import { nolotusId } from "core/init";
import Cybots from "ai/cybot/Cybots";
import { useAuth } from "auth/useAuth";

const NewDialogButton = () => {
  const { isLoggedIn, user } = useAuth();

  const { t } = useTranslation();
  const theme = useSelector(selectTheme);
  const {
    visible: AIsModalVisible,
    open: openAIsModal,
    close: closeAIsModal,
  } = useModal();

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
      <Button onClick={openAIsModal} icon={<PlusIcon size={24} />} width="100%">
        {t("newDialog")}
      </Button>

      <Dialog
        isOpen={AIsModalVisible}
        onClose={closeAIsModal}
        title={<h2 style={dialogTitleStyle}>{t("createDialog")}</h2>}
      >
        {isLoggedIn && (
          <>
            <h3 style={{ marginBottom: "1rem" }}>我的 AIs</h3>
            <Cybots queryUserId={user?.userId} closeModal={closeAIsModal} />
          </>
        )}

        <h3 style={{ marginBottom: "1rem" }}>公共 AIs</h3>
        <Cybots queryUserId={nolotusId} closeModal={closeAIsModal} />
      </Dialog>
    </>
  );
};

export default NewDialogButton;
