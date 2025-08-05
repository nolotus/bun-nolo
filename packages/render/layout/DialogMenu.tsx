// File: src/components/layout/DialogMenu.jsx

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuEllipsis, LuTrash2, LuPlus, LuInfo } from "react-icons/lu"; // 新增: LuInfo

import { useAppDispatch } from "app/store";
import { deleteCurrentDialog } from "chat/dialog/dialogSlice";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { zIndex } from "render/styles/zIndex";
import DialogInfoPanel from "chat/dialog/DialogInfoPanel";
import { Tooltip } from "render/web/ui/Tooltip";
import { ConfirmModal } from "render/web/ui/ConfirmModal";

const Spinner = () => <div className="topbar__spinner" />;

const DeleteButton = ({
  currentDialog,
  mobile,
}: {
  currentDialog: any;
  mobile?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { t } = useTranslation();

  const doDelete = async () => {
    if (!currentDialog.dbKey && !currentDialog.id) return;
    setBusy(true);
    try {
      await dispatch(
        deleteCurrentDialog(currentDialog.dbKey || currentDialog.id)
      ).unwrap();
      toast.success(t("deleteSuccess"));
      nav("/");
    } catch {
      toast.error(t("deleteFailed"));
    }
    setBusy(false);
    setOpen(false);
  };

  const btn = (
    <button
      className={`topbar__button ${mobile ? "topbar__button--mobile" : ""}`}
      onClick={() => setOpen(true)}
      disabled={busy}
      aria-label={t("delete")}
    >
      <LuTrash2 size={16} />
      {mobile && t("delete")}
    </button>
  );

  return (
    <>
      {mobile ? btn : <Tooltip content={t("delete")}>{btn}</Tooltip>}
      <ConfirmModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={doDelete}
        title={t("deleteDialogTitle", { title: currentDialog.title })}
        message={t("deleteDialogConfirmation")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        loading={busy}
      />
    </>
  );
};

const MobileMenu = ({ currentDialog }: { currentDialog: any }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(["chat", "common"]);
  const { isLoading, createNewDialog } = useCreateDialog();

  const onCreate = () => {
    createNewDialog({ agents: currentDialog.cybots });
    setOpen(false);
  };

  return (
    <div className="topbar__mobile-menu">
      <button
        className="topbar__button"
        onClick={() => setOpen(!open)}
        aria-label={t("chat:moreOptions")}
      >
        <LuEllipsis size={16} />
      </button>
      {open && (
        <>
          <div className="topbar__backdrop" onClick={() => setOpen(false)} />
          <div className="topbar__dropdown">
            <div className="topbar__menu-section">
              <DialogInfoPanel isMobile />
            </div>
            <div className="topbar__menu-section">
              {/* 新增: 移动端的信息按钮 */}
              <button className="topbar__button topbar__button--mobile">
                <LuInfo size={16} />
                <span>{t("common:info")}</span>
              </button>
              <button
                className="topbar__button topbar__button--mobile"
                onClick={onCreate}
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : <LuPlus size={16} />}
                <span>{t("chat:newchat")}</span>
              </button>
              <DeleteButton currentDialog={currentDialog} mobile />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * @description 对话菜单主组件
 */
const DialogMenu = ({ currentDialog }: { currentDialog: any }) => {
  const { t } = useTranslation();

  return (
    <>
      <h1 className="topbar__title" title={currentDialog.title}>
        {currentDialog.title}
      </h1>
      <div className="topbar__actions">
        <DialogInfoPanel />
        {/* 新增: 桌面端的信息图标按钮 */}
        <Tooltip content={t("info")}>
          <button className="topbar__button" aria-label={t("info")}>
            <LuInfo size={16} />
          </button>
        </Tooltip>
        <DeleteButton currentDialog={currentDialog} />
      </div>
      <MobileMenu currentDialog={currentDialog} />
    </>
  );
};

export default DialogMenu;
