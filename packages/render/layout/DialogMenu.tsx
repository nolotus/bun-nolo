// File: render/layout/DialogMenu.jsx

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
import { ConfirmModal } from "render/web/ui/ConfirmModal";

const LoadingSpinner = () => (
  <div className="dialog-menu__spinner">
    <div className="spinner-ring" />
  </div>
);

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
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleDelete = async () => {
    if (!currentDialog.dbKey && !currentDialog.id) return;
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

  const buttonElement = (
    <button
      className={`dialog-menu__action-button ${mobile ? "dialog-menu__action-button--mobile" : ""}`}
      onClick={() => setOpen(true)}
      disabled={busy}
      aria-label={t("delete")}
    >
      {busy ? <LoadingSpinner /> : <LuTrash2 size={16} />}
      {mobile && <span className="button-text">{t("delete")}</span>}
    </button>
  );

  return (
    <>
      {mobile ? (
        buttonElement
      ) : (
        <Tooltip content={t("delete")} placement="bottom">
          {buttonElement}
        </Tooltip>
      )}
      <ConfirmModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
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

const TokenInfo = ({ tokens }: { tokens: number | null }) => {
  const { t } = useTranslation(["chat", "common"]);
  const formattedTokens = tokens?.toLocaleString() ?? "0";

  return (
    <div className="dialog-menu__token-info">
      <LuInfo size={14} />
      <span className="token-label">{t("common:tokens")}:</span>
      <span className="token-value">{formattedTokens}</span>
    </div>
  );
};

const MobileMenu = ({
  currentDialog,
  currentDialogTokens,
}: {
  currentDialog: any;
  currentDialogTokens: number | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation(["chat", "common"]);
  const { isLoading, createNewDialog } = useCreateDialog();

  const handleCreateDialog = () => {
    createNewDialog({ agents: currentDialog.cybots });
    setIsOpen(false);
  };

  const handleToggle = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);

  return (
    <div className="dialog-menu__mobile-wrapper">
      <button
        className="dialog-menu__mobile-trigger"
        onClick={handleToggle}
        aria-label={t("chat:moreOptions")}
        aria-expanded={isOpen}
      >
        <LuEllipsis size={16} />
      </button>

      {isOpen && (
        <>
          <div className="dialog-menu__backdrop" onClick={handleClose} />
          <div className="dialog-menu__mobile-dropdown">
            <div className="mobile-section mobile-section--info">
              <DialogInfoPanel isMobile />
            </div>

            <div className="mobile-section mobile-section--actions">
              <TokenInfo tokens={currentDialogTokens} />

              <button
                className="dialog-menu__action-button dialog-menu__action-button--mobile"
                onClick={handleCreateDialog}
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : <LuPlus size={16} />}
                <span className="button-text">{t("chat:newchat")}</span>
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
 * @description 对话菜单主组件 - 完全使用CSS变量版本
 */
const DialogMenu = ({ currentDialog }: { currentDialog: any }) => {
  const { t } = useTranslation(["chat", "common"]);
  const currentDialogTokens = useAppSelector(selectTotalDialogTokens);

  const tokenTooltipContent = `${t("common:tokens")}: ${currentDialogTokens?.toLocaleString() ?? "0"}`;

  return (
    <>
      <div className="dialog-menu">
        <div className="dialog-menu__header">
          <h1 className="dialog-menu__title" title={currentDialog.title}>
            {currentDialog.title}
          </h1>
        </div>

        <div className="dialog-menu__desktop-actions">
          <DialogInfoPanel />

          <Tooltip content={tokenTooltipContent} placement="bottom">
            <div
              className="dialog-menu__info-button"
              aria-label={t("common:info")}
            >
              <LuInfo size={16} />
            </div>
          </Tooltip>

          <DeleteButton currentDialog={currentDialog} />
        </div>

        <div className="dialog-menu__mobile-actions">
          <MobileMenu
            currentDialog={currentDialog}
            currentDialogTokens={currentDialogTokens}
          />
        </div>
      </div>

      <style>{`
        .dialog-menu {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 100%;
          gap: var(--space-4);
          padding: 0 var(--space-4);
        }

        .dialog-menu__header {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
        }

        .dialog-menu__title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .dialog-menu__desktop-actions {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          flex-shrink: 0;
        }

        .dialog-menu__mobile-actions {
          display: none;
          flex-shrink: 0;
        }

        .dialog-menu__action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--space-8);
          height: var(--space-8);
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--textSecondary);
          cursor: pointer;
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          position: relative;
        }

        .dialog-menu__action-button:hover:not(:disabled) {
          background: var(--backgroundHover);
          color: var(--text);
          transform: translateY(-1px);
        }

        .dialog-menu__action-button:active:not(:disabled) {
          transform: translateY(0) scale(0.95);
        }

        .dialog-menu__action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .dialog-menu__action-button--mobile {
          width: auto;
          height: auto;
          padding: var(--space-3) var(--space-4);
          justify-content: flex-start;
          gap: var(--space-2);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .dialog-menu__action-button--mobile:hover:not(:disabled) {
          transform: none;
          background: var(--backgroundHover);
        }

        .dialog-menu__info-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--space-8);
          height: var(--space-8);
          color: var(--textSecondary);
          border-radius: 6px;
          transition: all 0.15s ease;
          cursor: help;
        }

        .dialog-menu__info-button:hover {
          background: var(--backgroundHover);
          color: var(--primary);
          transform: translateY(-1px);
        }

        .dialog-menu__spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }

        .spinner-ring {
          width: 12px;
          height: 12px;
          border: 2px solid var(--border);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dialog-menu__token-info {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--backgroundTertiary);
          border-radius: 8px;
          font-size: 12px;
          color: var(--textSecondary);
          border: 1px solid var(--borderLight);
          transition: all 0.15s ease;
        }

        .dialog-menu__token-info:hover {
          background: var(--backgroundHover);
          border-color: var(--border);
        }

        .token-label {
          font-weight: 500;
        }

        .token-value {
          font-weight: 600;
          color: var(--text);
          font-family: ui-monospace, 'SF Mono', 'Monaco', monospace;
          background: var(--backgroundGhost);
          padding: 1px var(--space-1);
          border-radius: 4px;
          letter-spacing: 0.3px;
        }

        .button-text {
          font-size: 14px;
          font-weight: 500;
        }

        .dialog-menu__mobile-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .dialog-menu__mobile-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--space-8);
          height: var(--space-8);
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--textSecondary);
          cursor: pointer;
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .dialog-menu__mobile-trigger:hover,
        .dialog-menu__mobile-trigger[aria-expanded="true"] {
          background: var(--backgroundHover);
          color: var(--text);
        }

        .dialog-menu__mobile-trigger:active {
          transform: scale(0.95);
        }

        .dialog-menu__backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 998;
          animation: fadeIn 0.2s ease-out;
        }

        .dialog-menu__mobile-dropdown {
          position: absolute;
          top: calc(100% + var(--space-2));
          right: 0;
          min-width: 280px;
          max-width: 90vw;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 
            0 20px 40px -12px var(--shadowMedium),
            0 8px 16px -8px var(--shadowLight);
          z-index: 999;
          animation: slideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        .mobile-section {
          padding: var(--space-4);
        }

        .mobile-section--info {
          border-bottom: 1px solid var(--borderLight);
        }

        .mobile-section--actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .dialog-menu {
            padding: 0 var(--space-3);
          }

          .dialog-menu__title {
            font-size: 15px;
          }

          .dialog-menu__desktop-actions {
            display: none;
          }

          .dialog-menu__mobile-actions {
            display: flex;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dialog-menu__action-button,
          .dialog-menu__info-button,
          .dialog-menu__mobile-trigger,
          .dialog-menu__backdrop,
          .dialog-menu__mobile-dropdown,
          .spinner-ring {
            animation: none;
            transition: none;
          }

          .dialog-menu__action-button:hover:not(:disabled),
          .dialog-menu__info-button:hover {
            transform: none;
          }
        }

        @media (prefers-contrast: high) {
          .dialog-menu__action-button,
          .dialog-menu__info-button,
          .dialog-menu__mobile-trigger {
            border: 1px solid var(--border);
          }

          .dialog-menu__token-info {
            border: 2px solid var(--border);
          }
        }
      `}</style>
    </>
  );
};

export default DialogMenu;
