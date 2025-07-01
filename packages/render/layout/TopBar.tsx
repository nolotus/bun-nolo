import React, { useState, useCallback, Suspense, lazy } from "react";
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

// Lazy load the CreateMenuButton component
const CreateMenuButton = lazy(() => import("./CreateMenuButton"));

const Spinner = () => <div className="spinner-small" />;

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
      aria-label={t("delete")}
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

const MobileDialogMenu = ({ currentDialogConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("chat");
  const { isLoading, createNewDialog } = useCreateDialog();

  const handleCreateDialog = useCallback(() => {
    createNewDialog({ agents: currentDialogConfig.cybots });
    setIsOpen(false);
  }, [createNewDialog, currentDialogConfig]);

  return (
    <>
      <div className="mobile-menu">
        <button
          className="btn-action"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t("moreOptions")}
        >
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
                <button
                  className="btn-action btn-mobile"
                  onClick={handleCreateDialog}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : <PlusIcon size={16} />}
                  <span>{t("newchat")}</span>
                </button>
                <DeleteDialogButton
                  dialogConfig={currentDialogConfig}
                  isMobile
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const TopBar = ({ toggleSidebar }) => {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
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
            <button
              className="btn-action"
              onClick={toggleSidebar}
              aria-label={t("toggleSidebar")}
            >
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
                <DeleteDialogButton dialogConfig={currentDialogConfig} />
              </div>
              <MobileDialogMenu currentDialogConfig={currentDialogConfig} />
            </>
          )}
          {showEditTool && <CreateTool />}
        </div>

        <div className="topbar-section">
          {isLoggedIn ? (
            <>
              <Suspense fallback={<div className="btn-action-placeholder" />}>
                <CreateMenuButton currentDialogConfig={currentDialogConfig} />
              </Suspense>
              <LoggedInMenu />
            </>
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

        /* Action button styles are now in CreateMenuButton.tsx, but some specific ones remain */
        .btn-action { /* Base styles for consistent look */
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; cursor: pointer;
          color: var(--textSecondary); width: var(--space-8); height: var(--space-8);
          border-radius: 6px; transition: all 0.15s ease; flex-shrink: 0;
        }
        .btn-action:hover {
          background: var(--backgroundHover); color: var(--text);
        }
        .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-delete:hover {
          background: var(--primaryGhost); 
          color: var(--error);
        }
        .btn-action-placeholder { /* Suspense fallback style */
            width: var(--space-8); height: var(--space-8);
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner-small {
          width: 16px; height: 16px;
          border: 2px solid var(--borderLight);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        /* MobileMenu styles */
        .mobile-menu { position: relative; display: none; }
        .backdrop {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          z-index: ${zIndex.mobileMenuBackdrop}; background: transparent;
        }
        .dropdown {
          position: absolute; top: calc(100% + var(--space-2)); right: 0;
          background: var(--background); border: 1px solid var(--border);
          border-radius: 8px; min-width: 240px; padding: var(--space-2);
          z-index: ${zIndex.mobileMenuDropdown};
          box-shadow: var(--shadowHeavy);
        }
        .menu-section { display: flex; flex-direction: column; gap: var(--space-1); }
        .menu-section:not(:last-child) {
          margin-bottom: var(--space-2); padding-bottom: var(--space-2);
          border-bottom: 1px solid var(--borderLight);
        }
        .btn-mobile {
          width: 100% !important; justify-content: flex-start !important;
          gap: var(--space-3) !important; padding: var(--space-3) !important;
          height: auto !important;
          font-size: 14px; font-weight: 400;
        }
        
        @media (max-width: 768px) {
          .topbar { padding: 0 var(--space-4); }
          .topbar-center { padding: 0 var(--space-3); gap: var(--space-2); }
          .dialog-title { font-size: 15px; max-width: 180px; }
          .topbar-section { min-width: 80px; }
          .desktop-actions { display: none !important; }
          .mobile-menu { display: block; }
        }
        
        @media (max-width: 480px) {
          .topbar { padding: 0 var(--space-3); }
          .dialog-title { font-size: 14px; max-width: 120px; }
          .topbar-section { min-width: auto; gap: var(--space-1); }
        }
      `}</style>
    </>
  );
};

export default TopBar;
