import React, { useCallback, useState } from "react";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";
import Button from "render/ui/Button";
import { useSelector, useDispatch } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { themeStyles } from "render/ui/styles";
import EditCybot from "ai/cybot/EditCybot";
import { Dialog } from "render/ui/Dialog";
import toast from "react-hot-toast";
import { deleteData } from "database/dbSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import withTranslations from "i18n/withTranslations";
import { layout } from "render/styles/layout";
import { txt } from "render/styles/txt";
import { sizes } from "render/styles/sizes";

const CybotBlock = ({ item, closeModal }) => {
  const { t } = useTranslation(); // 初始化 t 函数
  const { isLoading, createNewDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();

  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const startDialog = async () => {
    try {
      const cybotId = item.id;
      createNewDialog({ cybots: [cybotId] });
      if (closeModal) {
        closeModal();
      }
    } catch (error) {
      // 错误处理
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    openEdit();
  };

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await dispatch(deleteData({ id: item.id }));
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"));
    } finally {
      setDeleting(false);
    }
  }, [dispatch, item.id, navigate, t]);

  return (
    <div
      style={{
        ...layout.flexColumn,
        padding: sizes.size3,
        ...themeStyles.surface2(theme),
        ...themeStyles.radShadow(theme),
        borderRadius: "5px",
      }}
    >
      <div style={{ ...layout.flexBetween, marginBottom: sizes.size2 }}>
        <div
          style={{
            ...txt.ellipsis,
            ...txt.semiBold,
            maxWidth: "60%",
          }}
          title={item.name}
        >
          {item.name}
        </div>
      </div>
      <div style={{ ...layout.flexGrow1, marginBottom: sizes.size2 }}>
        <div style={{ ...txt.ellipsis }}>
          <span style={{ ...txt.semiBold }}>{t("modelName")}：</span>
          {item.model}
        </div>
        <div style={txt.ellipsis}>
          <span style={{ ...txt.semiBold }}>{t("introduction")}：</span>
          {item.introduction}
        </div>
      </div>
      <div style={{ ...layout.flex, gap: sizes.size1 }}>
        <Button
          style={{
            padding: ".5rem",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
          loading={isLoading}
          onClick={startDialog}
        >
          {t("dialog")}
        </Button>
        <Button
          style={{
            padding: ".5rem",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
          onClick={handleEditClick}
        >
          {t("edit")}
        </Button>
        <Button
          style={{
            padding: ".5rem",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
          onClick={handleDelete}
          loading={deleting}
        >
          {t("delete")}
        </Button>
      </div>
      {editVisible && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`${t("edit")} ${item.name || t("cybot")}`}
        >
          <EditCybot initialValues={item} onClose={closeEdit} />
        </Dialog>
      )}
    </div>
  );
};

export default withTranslations(CybotBlock, ["chat", "ai"]);
