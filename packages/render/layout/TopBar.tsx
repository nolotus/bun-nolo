// render/layout/TopBar.tsx
import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "auth/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "app/store";
import { zIndex } from "render/styles/zIndex";
import { extractUserId } from "core/prefix";
import { selectPageData } from "render/page/pageSlice";
import {
  selectCurrentDialogConfig,
  deleteCurrentDialog,
} from "chat/dialog/dialogSlice";
import { useCreateDialog } from "chat/dialog/useCreateDialog";

import { RoutePaths } from "auth/web/routes";
//web
import { CreateTool } from "create/CreateTool";
import { LoggedInMenu } from "auth/web/IsLoggedInMenu";

import NavListItem from "render/layout/blocks/NavListItem";
import DialogInfoPanel from "chat/dialog/DialogInfoPanel";
import {
  SignInIcon,
  ThreeBarsIcon,
  HomeIcon,
  KebabHorizontalIcon,
  TrashIcon,
  PlusIcon,
} from "@primer/octicons-react";
import LanguageSwitcher from "render/web/ui/LanguageSwitcher";
import { Tooltip } from "render/web/ui/Tooltip";
import { ConfirmModal } from "render/web/ui/ConfirmModal";

// --- Spinner Component (Refactored) ---
// 不再需要订阅 theme，样式完全由 CSS 变量控制
const Spinner = () => (
  <>
    <div className="spinner" />
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
      .spinner {
        width: 16px; height: 16px;
        border: 2px solid var(--borderLight);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    `}</style>
  </>
);

const CreateDialogButton = ({ dialogConfig, isMobile = false }) => {
  const { isLoading, createNewDialog } = useCreateDialog();
  const { t } = useTranslation("chat");

  const handleClick = useCallback(() => {
    createNewDialog({ agents: dialogConfig.cybots });
  }, [createNewDialog, dialogConfig.cybots]);

  const button = (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`btn-action ${isMobile ? "btn-mobile" : ""}`}
    >
      {isLoading ? <Spinner /> : <PlusIcon size={16} />}
      {isMobile && <span>{t("newchat")}</span>}
    </button>
  );

  return isMobile ? (
    button
  ) : (
    <Tooltip content={t("newchat")} placement="bottom">
      {button}
    </Tooltip>
  );
};

const DeleteDialogButton = ({ dialogConfig, isMobile = false }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await dispatch(
        deleteCurrentDialog(dialogConfig.dbKey || dialogConfig.id)
      );
      toast.success(t("deleteSuccess"));
      navigate(-1);
    } catch (error) {
      toast.error(t("deleteFailed"));
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  }, [dispatch, navigate, dialogConfig, t]);

  const button = (
    <button
      className={`btn-action btn-delete ${isMobile ? "btn-mobile" : ""}`}
      onClick={() => setIsOpen(true)}
      disabled={isDeleting}
    >
      <TrashIcon size={16} />
      {isMobile && <span>{t("delete")}</span>}
    </button>
  );

  return (
    <>
      {isMobile ? (
        button
      ) : (
        <Tooltip content={t("delete")} placement="bottom">
          {button}
        </Tooltip>
      )}
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteDialogTitle", { title: dialogConfig.title })}
        message={t("deleteDialogConfirmation")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        loading={isDeleting}
      />
    </>
  );
};

// --- MobileDialogMenu Component (Refactored) ---
// 同样移除了 theme 依赖，样式完全由 CSS 变量驱动
const MobileDialogMenu = ({ currentDialogConfig }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="mobile-menu">
        <button className="btn-action" onClick={() => setIsOpen(!isOpen)}>
          <KebabHorizontalIcon size={16} />
        </button>

        {isOpen && (
          <>
            <div className="backdrop" onClick={() => setIsOpen(false)} />
            <div className="dropdown">
              <div className="menu-section">
                <DialogInfoPanel isMobile />
              </div>
              <div className="menu-section">
                <CreateDialogButton
                  dialogConfig={currentDialogConfig}
                  isMobile
                />
                <DeleteDialogButton
                  dialogConfig={currentDialogConfig}
                  isMobile
                />
              </div>
            </div>
          </>
        )}
      </div>

      <style href="mobile-dialog-menu-styles" precedence="utility">{`
        .mobile-menu { position: relative; display: none; }
        .backdrop {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          z-index: ${zIndex.mobileMenuBackdrop}; background: transparent;
        }
        .dropdown {
          position: absolute; top: calc(100% + var(--space-2)); right: 0;
          background: var(--background); border: 1px solid var(--border);
          border-radius: 6px; min-width: 240px; padding: var(--space-4);
          z-index: ${zIndex.mobileMenuDropdown};
          box-shadow: var(--shadowHeavy);
        }
        .menu-section { display: flex; flex-direction: column; gap: var(--space-2); }
        .menu-section:not(:last-child) {
          margin-bottom: var(--space-4); padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--borderLight);
        }
        .btn-mobile {
          width: 100% !important; justify-content: flex-start !important;
          gap: var(--space-3) !important; padding: var(--space-3) !important;
          font-size: 14px; font-weight: 500;
        }
        @media (max-width: 768px) {
          .mobile-menu { display: block; }
          .desktop-actions { display: none !important; }
        }
      `}</style>
    </>
  );
};

// --- TopBar Component (Refactored) ---
const TopBar = ({ toggleSidebar }) => {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  // 不再需要订阅 theme
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const pageData = useAppSelector(selectPageData);
  const { pageKey } = useParams();

  const dataCreator = pageKey ? extractUserId(pageKey) : undefined;
  const isCreator = dataCreator === user?.userId;
  const allowEdit = isCreator || !pageData.creator;
  const hasPageData =
    pageData.isInitialized && (pageData.content || pageData.slateData);
  const showEditTool = pageKey?.startsWith("page") && allowEdit && hasPageData;

  return (
    <>
      <div className="topbar">
        <div className="topbar-section">
          {!isLoggedIn && (
            <NavListItem
              label={t("home")}
              icon={<HomeIcon size={16} />}
              path="/"
            />
          )}
          {toggleSidebar && (
            <button className="btn-action" onClick={toggleSidebar}>
              <ThreeBarsIcon size={16} />
            </button>
          )}
        </div>

        <div className="topbar-center">
          {currentDialogConfig && (
            <>
              <h1 className="dialog-title" title={currentDialogConfig.title}>
                {currentDialogConfig.title}
              </h1>
              <div className="desktop-actions">
                <DialogInfoPanel />
                <CreateDialogButton dialogConfig={currentDialogConfig} />
                <DeleteDialogButton dialogConfig={currentDialogConfig} />
              </div>
              <MobileDialogMenu currentDialogConfig={currentDialogConfig} />
            </>
          )}
          {showEditTool && <CreateTool />}
        </div>

        <div className="topbar-section">
          {isLoggedIn ? (
            <LoggedInMenu />
          ) : (
            <>
              <LanguageSwitcher />
              <NavListItem
                label={t("login")}
                icon={<SignInIcon size={16} />}
                path={RoutePaths.LOGIN}
              />
            </>
          )}
        </div>
      </div>

      {/* 样式标签使用静态 href，不再依赖 theme 变量 */}
      <style href="topbar-styles" precedence="default">{`
        .topbar {
          display: flex; justify-content: space-between; align-items: center;
          background: var(--background); position: sticky; top: 0;
          padding: 0 var(--space-5); z-index: ${zIndex.topbar};
          height: var(--headerHeight);
          border-bottom: 1px solid var(--border);
        }
        
        .topbar-section {
          display: flex; align-items: center; gap: var(--space-2);
          min-width: 100px; flex-shrink: 0;
        }
        .topbar-section:last-child { justify-content: flex-end; }
        
        .topbar-center {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 0 var(--space-5); gap: var(--space-4); min-width: 0;
        }

        .desktop-actions { 
            display: flex; align-items: center; gap: var(--space-3); 
        }
        
        .dialog-title {
          margin: 0; font-size: 16px; font-weight: 500; color: var(--text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 300px;
        }
        
        .btn-action {
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; cursor: pointer;
          color: var(--textSecondary); width: var(--space-8); height: var(--space-8);
          border-radius: 6px; transition: all 0.15s ease; flex-shrink: 0;
        }
        .btn-action:hover {
          background: var(--backgroundHover); color: var(--text);
        }
        .btn-action:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-delete:hover {
          /* 使用 color-mix 实现带透明度的背景色，3.13% 约等于 hex #08 */
          background: color-mix(in srgb, var(--error) 3.13%, transparent); 
          color: var(--error);
        }
        
        @media (max-width: 768px) {
          .topbar { padding: 0 var(--space-4); }
          .topbar-center { padding: 0 var(--space-3); gap: var(--space-2); }
          .dialog-title { font-size: 15px; max-width: 180px; }
          .topbar-section { min-width: 80px; }
        }
        
        @media (max-width: 480px) {
          .topbar { padding: 0 var(--space-3); }
          .dialog-title { font-size: 14px; max-width: 120px; }
          .topbar-section { min-width: 60px; gap: var(--space-1); }
        }
      `}</style>
    </>
  );
};

export default TopBar;
