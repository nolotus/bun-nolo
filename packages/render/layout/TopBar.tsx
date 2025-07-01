import React, { useState, useCallback, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  SignInIcon,
  ThreeBarsIcon,
  HomeIcon,
  KebabHorizontalIcon,
  TrashIcon,
  PlusIcon,
} from "@primer/octicons-react";

// Redux & State Management
import { useAppDispatch, useAppSelector } from "app/store";
import { useAuth } from "auth/hooks/useAuth";
import {
  selectPageData,
  selectIsReadOnly,
  selectPageDbSpaceId,
  toggleReadOnly,
  savePage,
  selectIsSaving,
  selectHasPendingChanges,
} from "render/page/pageSlice";
import {
  selectCurrentDialogConfig,
  deleteCurrentDialog,
} from "chat/dialog/dialogSlice";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { useCreateDialog } from "chat/dialog/useCreateDialog";

// Utils & Routes
import { extractUserId } from "core/prefix";
import { zIndex } from "render/styles/zIndex";
import { RoutePaths } from "auth/web/routes";

// UI Components
import NavListItem from "render/layout/blocks/NavListItem";
import DialogInfoPanel from "chat/dialog/DialogInfoPanel";
import LanguageSwitcher from "render/web/ui/LanguageSwitcher";
import { Tooltip } from "render/web/ui/Tooltip";
import { ConfirmModal } from "render/web/ui/ConfirmModal";
import ModeToggle from "render/web/ui/ModeToggle";
import Button from "render/web/ui/Button";
import { LoggedInMenu } from "auth/web/IsLoggedInMenu";

// Lazy load
const CreateMenuButton = lazy(() => import("./CreateMenuButton"));

// --- Reusable Components within TopBar ---

const Spinner = () => <div className="spinner-small" />;

const DeleteDialogButton = ({ dialogConfig, isMobile = false }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!dialogConfig.dbKey && !dialogConfig.id) return;
    setIsDeleting(true);
    try {
      await dispatch(
        deleteCurrentDialog(dialogConfig.dbKey || dialogConfig.id)
      ).unwrap();
      toast.success(t("deleteSuccess"));
      navigate("/");
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
              <DeleteDialogButton dialogConfig={currentDialogConfig} isMobile />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- Main TopBar Component ---

const TopBar = ({ toggleSidebar }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { pageKey } = useParams();

  // --- State for Chat View ---
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);

  // --- State & Logic for Page/Create View (Merged from CreateTool) ---
  const pageState = useAppSelector(selectPageData);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const dbSpaceId = useAppSelector(selectPageDbSpaceId);
  const isSaving = useAppSelector(selectIsSaving);
  const hasPendingChanges = useAppSelector(selectHasPendingChanges);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);

  const [isDeletePageModalOpen, setDeletePageModalOpen] = useState(false);
  const [isDeletingPage, setDeletingPage] = useState(false);

  const dataCreator = pageKey ? extractUserId(pageKey) : undefined;
  const isCreator = dataCreator === user?.userId;
  const allowEdit = isCreator || !pageState.creator;
  const showEditTool =
    pageKey?.startsWith("page") && allowEdit && pageState.isInitialized;

  const handleToggleEdit = useCallback(() => {
    dispatch(toggleReadOnly());
  }, [dispatch]);

  const handleSavePage = useCallback(async () => {
    try {
      await dispatch(savePage()).unwrap();
      toast.success(t("saveSuccess"));
    } catch (err) {
      if (err.message !== "Aborted") {
        toast.error(t("saveFailed"));
      }
    }
  }, [dispatch, t]);

  const handleDeletePage = useCallback(async () => {
    const spaceIdToDeleteFrom = dbSpaceId || currentSpaceId;
    if (!pageKey || !spaceIdToDeleteFrom) {
      toast.error(t("deleteFailedInfoMissing", "删除失败，信息不完整"));
      return;
    }
    setDeletingPage(true);
    try {
      await dispatch(
        deleteContentFromSpace({
          contentKey: pageKey,
          spaceId: spaceIdToDeleteFrom,
        })
      ).unwrap();
      toast.success(t("deleteSuccess"));
      navigate(-1, { replace: true });
    } catch (err) {
      toast.error(t("deleteFailed"));
    } finally {
      setDeletingPage(false);
      setDeletePageModalOpen(false);
    }
  }, [dispatch, navigate, t, pageKey, dbSpaceId, currentSpaceId]);

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
          {/* ---- Chat View UI ---- */}
          {currentDialogConfig && !showEditTool && (
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

          {/* ---- Page/Create View UI (Merged) ---- */}
          {showEditTool && (
            <>
              <h1 className="dialog-title" title={pageState.title || ""}>
                {pageState.title || t("loading", "加载中...")}
              </h1>

              <div className="desktop-actions">
                <ModeToggle isEdit={!isReadOnly} onChange={handleToggleEdit} />
                <button
                  className="btn-action btn-delete"
                  onClick={() => setDeletePageModalOpen(true)}
                  disabled={isDeletingPage}
                  title={t("delete")}
                >
                  <TrashIcon size={16} />
                </button>
                <Button
                  variant="primary"
                  onClick={handleSavePage}
                  size="small"
                  disabled={isReadOnly || isSaving || !hasPendingChanges}
                  loading={isSaving}
                >
                  {isSaving ? t("saving", "保存中...") : t("save", "保存")}
                </Button>
              </div>

              {/* Mobile Menu for Page Tools - shown only on mobile */}
              <div className="mobile-menu">
                <KebabHorizontalIcon size={16} />{" "}
                {/* Placeholder for a future dropdown if needed */}
                <ModeToggle isEdit={!isReadOnly} onChange={handleToggleEdit} />
                <button
                  className="btn-action btn-delete"
                  onClick={() => setDeletePageModalOpen(true)}
                  disabled={isDeletingPage}
                  title={t("delete")}
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </>
          )}
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

      {/* --- Modals --- */}
      {showEditTool && (
        <ConfirmModal
          isOpen={isDeletePageModalOpen}
          onClose={() => setDeletePageModalOpen(false)}
          onConfirm={handleDeletePage}
          title={t("deleteDialogTitle", { title: pageState.title || pageKey })}
          message={t("deleteDialogConfirmation")}
          confirmText={t("delete")}
          cancelText={t("cancel")}
          type="error"
          loading={isDeletingPage}
        />
      )}

      <style href="topbar-styles" precedence="default">{`
        .topbar {
          display: flex; justify-content: space-between; align-items: center;
          background: var(--background); position: sticky; top: 0;
          padding: 0 var(--space-4); z-index: ${zIndex.topbar};
          height: var(--headerHeight);
          border-bottom: 1px solid var(--border);
          gap: var(--space-4);
        }
        .topbar-section {
          display: flex; align-items: center; gap: var(--space-2);
          flex-shrink: 0;
        }
        .topbar-section:first-child { justify-content: flex-start; }
        .topbar-section:last-child { justify-content: flex-end; }
        .topbar-center {
          flex: 1; display: flex; align-items: center; justify-content: center;
          gap: var(--space-4); min-width: 0;
        }
        .desktop-actions { 
          display: flex; align-items: center; gap: var(--space-3); 
        }
        .dialog-title {
          margin: 0; font-size: 16px; font-weight: 500; color: var(--text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .btn-action {
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; cursor: pointer;
          color: var(--textSecondary); width: var(--space-8); height: var(--space-8);
          border-radius: 6px; transition: all 0.15s ease; flex-shrink: 0;
        }
        .btn-action:hover { background: var(--backgroundHover); color: var(--text); }
        .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-delete:hover { background: var(--primaryGhost); color: var(--error); }
        .btn-action-placeholder { width: var(--space-8); height: var(--space-8); }
        
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner-small {
          width: 16px; height: 16px;
          border: 2px solid var(--borderLight);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        /* Mobile Menu General Styles */
        .mobile-menu { position: relative; display: none; }
        .backdrop {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          z-index: ${zIndex.mobileMenuBackdrop}; background: transparent;
        }
        .dropdown {
          position: absolute; top: calc(100% + var(--space-2)); right: 0;
          background: var(--background); border: 1px solid var(--border);
          border-radius: 8px; min-width: 240px; padding: var(--space-2);
          z-index: ${zIndex.mobileMenuDropdown}; box-shadow: var(--shadowHeavy);
        }
        .menu-section { display: flex; flex-direction: column; gap: var(--space-1); }
        .menu-section:not(:last-child) {
          margin-bottom: var(--space-2); padding-bottom: var(--space-2);
          border-bottom: 1px solid var(--borderLight);
        }
        .btn-mobile {
          width: 100% !important; justify-content: flex-start !important;
          gap: var(--space-3) !important; padding: var(--space-3) !important;
          height: auto !important; font-size: 14px; font-weight: 400;
        }
        
        @media (max-width: 768px) {
          .topbar { padding: 0 var(--space-2); gap: var(--space-2); }
          .topbar-center { gap: var(--space-2); }
          .dialog-title { font-size: 15px; flex-grow: 1; text-align: center; }
          .desktop-actions { display: none !important; }
          .mobile-menu { 
            display: flex; 
            align-items: center; 
            gap: var(--space-2); 
            /* For page tools on mobile, we display them directly instead of a dropdown */
            /* But for dialog, we keep the dropdown behavior */
          }
          /* This specifically targets the mobile menu for dialogs to show the kebab icon */
          .topbar-center > .mobile-menu .btn-action[aria-label="More options"] {
             display: flex;
          }
          /* This hides the direct-display icons when they are part of the dialog menu */
          .topbar-center > .mobile-menu:not(:has(.btn-action[aria-label="More options"])) .btn-action[aria-label="More options"] {
             display: none;
          }
           /* A bit complex, but this makes the page edit tools (ModeToggle etc) only show on mobile if showEditTool is true */
          .topbar-center > .mobile-menu:not(:has(button[aria-label="More options"])) {
            display: none;
          }
          ${showEditTool ? `.topbar-center > .mobile-menu:not(:has(button[aria-label="More options"])) { display: flex; }` : ""}
          ${currentDialogConfig ? `.topbar-center > .mobile-menu:has(button[aria-label="More options"]) { display: block; }` : ""}

        }
        
        @media (max-width: 480px) {
          .dialog-title { font-size: 14px; }
          .topbar-section:first-child > .btn-action { display: flex; } /* Ensure toggle is always visible */
          .topbar-section > * { transform: scale(0.95); }
        }
      `}</style>
    </>
  );
};

export default TopBar;
