import React, { useCallback, useState } from "react";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";
import Button from "render/ui/Button";
import { useSelector, useDispatch } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { styles, themeStyles } from "render/ui/styles";
import EditCybot from "ai/cybot/EditCybot";
import { Dialog } from "render/ui/Dialog";
import toast from "react-hot-toast";
import { deleteData } from "database/dbSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import withTranslations from "i18n/withTranslations";

const CybotBlock = ({ item, closeModal }) => {
  const { t } = useTranslation(); // 初始化 t 函数
  const { isLoading, createDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();

  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const createNewDialog = async () => {
    try {
      const cybotId = item.id;
      await createDialog({ cybots: [cybotId] });
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
      await dispatch(deleteData({ id: item.id })).unwrap();
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
        ...styles.flexColumn,
        ...styles.p3,
        ...themeStyles.surface2(theme),
        ...themeStyles.radShadow(theme),
        ...styles.roundedMd,
      }}
    >
      <div style={{ ...styles.flexBetween, ...styles.mb2 }}>
        <div
          style={{
            ...styles.textEllipsis,
            ...styles.fontWeight600,
            maxWidth: "60%",
          }}
          title={item.name}
        >
          {item.name}
        </div>
      </div>
      <div style={{ ...styles.flexGrow1, ...styles.mb2 }}>
        <div style={{ ...styles.textEllipsis }}>
          <span style={{ ...styles.fontWeight600 }}>{t("modelName")}：</span>
          {item.model}
        </div>
        <div style={styles.textEllipsis}>
          <span style={{ ...styles.fontWeight600 }}>{t("introduction")}：</span>
          {item.introduction}
        </div>
      </div>
      <div style={{ ...styles.flex, ...styles.gap1 }}>
        <Button
          style={styles.buttonBase}
          loading={isLoading}
          onClick={createNewDialog}
        >
          {t("dialog")}
        </Button>
        <Button style={styles.buttonBase} onClick={handleEditClick}>
          {t("edit")}
        </Button>
        <Button
          style={{
            ...styles.buttonBase,
            ...styles.transition,
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
