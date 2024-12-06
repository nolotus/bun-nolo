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
import { stylePresets } from "render/ui/stylePresets";

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
        ...stylePresets.flexColumn,
        ...stylePresets.p3,
        ...themeStyles.surface2(theme),
        ...themeStyles.radShadow(theme),
        ...stylePresets.roundedMd,
      }}
    >
      <div style={{ ...stylePresets.flexBetween, ...stylePresets.mb2 }}>
        <div
          style={{
            ...stylePresets.textEllipsis,
            ...stylePresets.fontWeight600,
            maxWidth: "60%",
          }}
          title={item.name}
        >
          {item.name}
        </div>
      </div>
      <div style={{ ...stylePresets.flexGrow1, ...stylePresets.mb2 }}>
        <div style={{ ...stylePresets.textEllipsis }}>
          <span style={{ ...stylePresets.fontWeight600 }}>
            {t("modelName")}：
          </span>
          {item.model}
        </div>
        <div style={stylePresets.textEllipsis}>
          <span style={{ ...stylePresets.fontWeight600 }}>
            {t("introduction")}：
          </span>
          {item.introduction}
        </div>
      </div>
      <div style={{ ...stylePresets.flex, ...stylePresets.gap1 }}>
        <Button
          style={stylePresets.buttonBase}
          loading={isLoading}
          onClick={startDialog}
        >
          {t("dialog")}
        </Button>
        <Button style={stylePresets.buttonBase} onClick={handleEditClick}>
          {t("edit")}
        </Button>
        <Button
          style={{
            ...stylePresets.buttonBase,
            ...stylePresets.transition,
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
