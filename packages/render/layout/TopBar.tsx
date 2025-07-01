import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "auth/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "app/store";
import { zIndex } from "render/styles/zIndex";
import { extractUserId } from "core/prefix";
import { selectPageData, createPage } from "render/page/pageSlice"; // 导入 createPage
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
  CommentDiscussionIcon,
  ArchiveIcon,
  NoteIcon,
} from "@primer/octicons-react";
import LanguageSwitcher from "render/web/ui/LanguageSwitcher";
import { Tooltip } from "render/web/ui/Tooltip";
import { ConfirmModal } from "render/web/ui/ConfirmModal";
import { Dialog } from "render/web/ui/Dialog";
import { CreateSpaceForm } from "create/space/CreateSpaceForm";

// Custom hook to detect clicks outside a specified element
const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// --- Spinner Component ---
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

// --- Custom hook for creating a new page (Updated) ---
const useCreatePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [isCreating, setIsCreating] = useState(false);

  const createNewPage = useCallback(async () => {
    setIsCreating(true);
    try {
      const key = await dispatch(createPage()).unwrap();
      navigate(`/${key}?edit=true`);
    } catch (error) {
      console.error("Failed to create page:", error);
      toast.error(t("createPageFailed", "创建页面失败"));
    } finally {
      setIsCreating(false);
    }
  }, [dispatch, navigate, t]);

  return { isCreatingPage: isCreating, createNewPage };
};

// --- CreateMenuButton Component (Updated) ---
const CreateMenuButton = ({ currentDialogConfig }) => {
  const { t } = useTranslation(["space", "chat", "page"]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isLoading: isCreatingDialog, createNewDialog } = useCreateDialog();
  const { isCreatingPage, createNewPage } = useCreatePage();

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  const handleCreateDialog = useCallback(() => {
    if (currentDialogConfig?.cybots) {
      createNewDialog({ agents: currentDialogConfig.cybots });
    }
    setIsMenuOpen(false);
  }, [createNewDialog, currentDialogConfig]);

  const handleCreateSpace = useCallback(() => {
    setIsModalOpen(true);
    setIsMenuOpen(false);
  }, []);

  const handleCreatePage = useCallback(async () => {
    await createNewPage();
    setIsMenuOpen(false);
  }, [createNewPage]);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <>
      <div className="create-menu-container" ref={menuRef}>
        <Tooltip content={t("common:create")} placement="bottom">
          <button
            className="btn-action"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <PlusIcon size={16} />
          </button>
        </Tooltip>

        {isMenuOpen && (
          <div className="create-dropdown-menu">
            <button
              className="create-menu-item"
              onClick={handleCreatePage}
              disabled={isCreatingPage}
            >
              {isCreatingPage ? <Spinner /> : <NoteIcon size={16} />}
              <span>{t("page:create_new_page", "新建页面")}</span>
            </button>
            <button className="create-menu-item" onClick={handleCreateSpace}>
              <ArchiveIcon size={16} />
              <span>{t("space:create_new_space")}</span>
            </button>
            {currentDialogConfig && (
              <button
                className="create-menu-item"
                onClick={handleCreateDialog}
                disabled={isCreatingDialog}
              >
                {isCreatingDialog ? (
                  <Spinner />
                ) : (
                  <CommentDiscussionIcon size={16} />
                )}
                <span>{t("chat:newchat")}</span>
              </button>
            )}
          </div>
        )}
      </div>
      <Dialog isOpen={isModalOpen} onClose={closeModal}>
        <CreateSpaceForm onClose={closeModal} />
      </Dialog>
    </>
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

const MobileDialogMenu = ({ currentDialogConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("chat");
  const { isLoading, createNewDialog } = useCreateDialog();

  const handleCreateDialog = useCallback(() => {
    createNewDialog({ agents: currentDialogConfig.cybots });
  }, [createNewDialog, currentDialogConfig]);

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
      {/* Styles are defined below in TopBar's style block */}
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
              <CreateMenuButton currentDialogConfig={currentDialogConfig} />
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

      <style href="topbar-and-menus-styles" precedence="default">{`
        .topbar {
          display: flex; justify-content: space-between; align-items: center;
          background: var(--background); position: sticky; top: 0;
          padding: 0 var(--space-5); z-index: ${zIndex.topbar};
          height: var(--headerHeight);
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
        .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-delete:hover {
          background: color-mix(in srgb, var(--error) 3.13%, transparent); 
          color: var(--error);
        }

        /* --- CreateMenu styles --- */
        .create-menu-container {
          position: relative;
        }
        .create-dropdown-menu {
          position: absolute;
          top: calc(100% + var(--space-2));
          right: 0;
          min-width: 220px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 6px;
          box-shadow: var(--shadowHeavy);
          z-index: ${zIndex.dropdown};
          padding: var(--space-2);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .create-menu-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          text-align: left;
          font-size: 14px;
          color: var(--text);
          transition: background-color 0.15s ease;
        }
        .create-menu-item:hover:not(:disabled) {
          background: var(--backgroundHover);
        }
        .create-menu-item:disabled {
          color: var(--textTertiary);
          cursor: not-allowed;
        }
        .create-menu-item > span {
          flex: 1;
        }
        
        /* --- MobileMenu styles --- */
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
