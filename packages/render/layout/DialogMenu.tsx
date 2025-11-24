import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuEllipsis, LuTrash2, LuPlus, LuInfo } from "react-icons/lu";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  deleteCurrentDialog,
  selectTotalDialogTokens,
} from "chat/dialog/dialogSlice";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import DialogInfoPanel from "chat/dialog/DialogInfoPanel";
import { Tooltip } from "render/web/ui/Tooltip";
import { ConfirmModal } from "render/web/ui/modal/ConfirmModal";

/**
 * 提取通用按钮组件，减少重复代码
 */
const MenuButton = ({
  icon,
  label,
  onClick,
  disabled,
  className = "",
  mobile = false,
  danger = false,
}) => (
  <button
    className={`menu-btn ${mobile ? "menu-btn--mobile" : ""} ${danger ? "menu-btn--danger" : ""} ${className}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
  >
    {disabled ? <div className="spinner" /> : icon}
    {mobile && label && <span className="menu-btn__text">{label}</span>}
  </button>
);

const DeleteButton = ({ currentDialog, mobile }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await dispatch(
        deleteCurrentDialog(currentDialog.dbKey || currentDialog.id)
      ).unwrap();
      toast.success(t("deleteSuccess"));
      navigate("/");
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const btn = (
    <MenuButton
      icon={<LuTrash2 size={16} />}
      label={t("delete")}
      onClick={() => setIsOpen(true)}
      disabled={busy}
      mobile={mobile}
      danger={!mobile} // 桌面端 hover 变红
    />
  );

  return (
    <>
      {mobile ? btn : <Tooltip content={t("delete")}>{btn}</Tooltip>}
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteDialogTitle", { title: currentDialog.title })}
        message={t("deleteDialogConfirmation")}
        type="error"
        loading={busy}
      />
    </>
  );
};

const MobileMenu = ({ currentDialog, tokens }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation(["chat", "common"]);
  const { isLoading, createNewDialog } = useCreateDialog();

  return (
    <div className="mobile-menu-wrapper">
      <MenuButton
        icon={<LuEllipsis size={18} />}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <>
          <div className="menu-backdrop" onClick={() => setIsOpen(false)} />
          <div className="mobile-dropdown">
            <div className="mobile-dropdown__section border-bottom">
              <DialogInfoPanel isMobile />
            </div>
            <div className="mobile-dropdown__section">
              <div className="token-badge">
                <LuInfo size={14} />
                <span>
                  {t("common:tokens")}: {tokens?.toLocaleString() ?? 0}
                </span>
              </div>
              <MenuButton
                mobile
                icon={<LuPlus size={16} />}
                label={t("chat:newchat")}
                onClick={() => {
                  createNewDialog({ agents: currentDialog.cybots });
                  setIsOpen(false);
                }}
                disabled={isLoading}
              />
              <DeleteButton currentDialog={currentDialog} mobile />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const DialogMenu = ({ currentDialog }) => {
  const { t } = useTranslation(["chat", "common"]);
  const tokens = useAppSelector(selectTotalDialogTokens);

  return (
    <div className="dialog-menu">
      <div className="dialog-menu__header">
        <h1 className="dialog-menu__title" title={currentDialog.title}>
          {currentDialog.title}
        </h1>
      </div>

      {/* 桌面端操作区 */}
      <div className="dialog-menu__actions desktop-only">
        <DialogInfoPanel />
        <Tooltip
          content={`${t("common:tokens")}: ${tokens?.toLocaleString() ?? "0"}`}
        >
          <div className="menu-info-icon">
            <LuInfo size={16} />
          </div>
        </Tooltip>
        <DeleteButton currentDialog={currentDialog} />
      </div>

      {/* 移动端操作区 */}
      <div className="dialog-menu__actions mobile-only">
        <MobileMenu currentDialog={currentDialog} tokens={tokens} />
      </div>

      <style>{`
        .dialog-menu {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: var(--space-3);
        }

        .dialog-menu__header {
          flex: 1;
          min-width: 0; /* 核心修复：允许 flex item 收缩 */
          display: flex;
          justify-content: center; /* 桌面端居中 */
        }

        .dialog-menu__title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
          max-width: 100%;
          line-height: 1.5;
        }

        .dialog-menu__actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        /* 按钮组件样式 */
        .menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          color: var(--textSecondary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .menu-btn:hover:not(:disabled) { background: var(--backgroundHover); color: var(--text); }
        .menu-btn:disabled { opacity: 0.5; cursor: wait; }
        
        .menu-btn--danger:hover:not(:disabled) { 
          background: var(--errorBg, rgba(255, 0, 0, 0.1)); 
          color: var(--error); 
        }

        .menu-btn--mobile {
          width: 100%;
          height: 40px;
          justify-content: flex-start;
          padding: 0 12px;
          gap: 10px;
          font-size: 14px;
        }
        
        .menu-info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          color: var(--textSecondary);
          cursor: help;
          border-radius: 6px;
        }
        .menu-info-icon:hover { background: var(--backgroundHover); color: var(--primary); }

        .spinner {
          width: 14px; height: 14px;
          border: 2px solid var(--border); border-top-color: var(--primary);
          border-radius: 50%; animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mobile Dropdown */
        .mobile-menu-wrapper { position: relative; }
        
        .menu-backdrop {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.2);
          backdrop-filter: blur(2px);
          z-index: 40;
        }

        .mobile-dropdown {
          position: absolute; top: 100%; right: 0; margin-top: 8px;
          min-width: 260px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: var(--shadowMedium);
          z-index: 50;
          overflow: hidden;
          animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .mobile-dropdown__section { padding: var(--space-2); }
        .border-bottom { border-bottom: 1px solid var(--borderLight); padding: var(--space-4); }

        .token-badge {
          display: flex; align-items: center; gap: var(--space-2);
          padding: 8px 12px;
          font-size: 12px; color: var(--textSecondary);
          background: var(--backgroundTertiary);
          border-radius: 6px;
          margin-bottom: var(--space-2);
        }

        @keyframes slideIn { 
          from { opacity: 0; transform: translateY(-8px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        .mobile-only { display: none; }
        
        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .mobile-only { display: flex; }
          .dialog-menu__header { justify-content: flex-start; } /* 移动端靠左 */
          .dialog-menu__title { text-align: left; font-size: 14px; }
        }
      `}</style>
    </div>
  );
};

export default DialogMenu;
