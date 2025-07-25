import React, { useState, useEffect, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LuLogIn,
  LuMenu,
  LuHouse,
  LuEllipsis,
  LuTrash2,
  LuPlus,
} from "react-icons/lu";
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
import { extractUserId } from "core/prefix";
import { zIndex } from "render/styles/zIndex";
import { RoutePaths } from "auth/web/routes";
import NavListItem from "render/layout/blocks/NavListItem";
import DialogInfoPanel from "chat/dialog/DialogInfoPanel";
import LanguageSwitcher from "render/web/ui/LanguageSwitcher";
import { Tooltip } from "render/web/ui/Tooltip";
import { ConfirmModal } from "render/web/ui/ConfirmModal";
import ModeToggle from "render/web/ui/ModeToggle";
import Button from "render/web/ui/Button";
import { LoggedInMenu } from "auth/web/IsLoggedInMenu";

const CreateMenuButton = lazy(() => import("./CreateMenuButton"));
const Spinner = () => <div className="topbar__spinner" />;

// CHANGE: Renamed cfg to currentDialog for clarity
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

// CHANGE: Renamed cfg to currentDialog
const MobileMenu = ({ currentDialog }: { currentDialog: any }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation("chat");
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
        aria-label={t("moreOptions")}
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
              <button
                className="topbar__button topbar__button--mobile"
                onClick={onCreate}
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : <LuPlus size={16} />}
                <span>{t("newchat")}</span>
              </button>
              <DeleteButton currentDialog={currentDialog} mobile />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const TopBar = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { pageKey } = useParams();
  // CHANGE: Renamed cfg to currentDialog
  const currentDialog = useAppSelector(selectCurrentDialogConfig);
  const page = useAppSelector(selectPageData);
  const readOnly = useAppSelector(selectIsReadOnly);
  const dbSpace = useAppSelector(selectPageDbSpaceId);
  const saving = useAppSelector(selectIsSaving);
  const pending = useAppSelector(selectHasPendingChanges);
  const curSpace = useAppSelector(selectCurrentSpaceId);

  const [delPgOpen, setDelPgOpen] = useState(false);
  const [deletingPg, setDeletingPg] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const creator = pageKey ? extractUserId(pageKey) : null;
  const isCreator = creator === user?.userId;
  const canEdit = isCreator || !page.creator;
  const showEdit = pageKey?.startsWith("page") && canEdit && page.isInitialized;

  const toggleEdit = () => dispatch(toggleReadOnly());
  const savePg = async () => {
    try {
      await dispatch(savePage()).unwrap();
      toast.success(t("saveSuccess"));
    } catch (e: any) {
      if (e.message !== "Aborted") toast.error(t("saveFailed"));
    }
  };
  const delPg = async () => {
    const spaceId = dbSpace || curSpace;
    if (!pageKey || !spaceId) {
      toast.error(t("deleteFailedInfoMissing"));
      return;
    }
    setDeletingPg(true);
    try {
      await dispatch(
        deleteContentFromSpace({ contentKey: pageKey, spaceId })
      ).unwrap();
      toast.success(t("deleteSuccess"));
      nav(-1, { replace: true });
    } catch {
      toast.error(t("deleteFailed"));
    }
    setDeletingPg(false);
    setDelPgOpen(false);
  };

  // CHANGE: Restructured JSX for new Grid layout
  return (
    <>
      <div className={`topbar ${isScrolled ? "topbar--scrolled" : ""}`}>
        <div className="topbar__section topbar__section--left">
          {!isLoggedIn && (
            <NavListItem
              label={t("home")}
              icon={<LuHouse size={16} />}
              path="/"
            />
          )}
          {toggleSidebar && (
            <button
              className="topbar__button"
              onClick={toggleSidebar}
              aria-label={t("toggleSidebar")}
            >
              <LuMenu size={16} />
            </button>
          )}
        </div>

        <div className="topbar__center">
          {currentDialog && !showEdit ? (
            <>
              <h1 className="topbar__title" title={currentDialog.title}>
                {currentDialog.title}
              </h1>
              <div className="topbar__actions">
                <DialogInfoPanel />
                <DeleteButton currentDialog={currentDialog} />
              </div>
              <MobileMenu currentDialog={currentDialog} />
            </>
          ) : (
            showEdit && (
              <>
                <div className="topbar__actions">
                  <ModeToggle isEdit={!readOnly} onChange={toggleEdit} />
                  <button
                    className="topbar__button topbar__button--delete"
                    onClick={() => setDelPgOpen(true)}
                    disabled={deletingPg}
                    title={t("delete")}
                  >
                    <LuTrash2 size={16} />
                  </button>
                  <Button
                    variant="primary"
                    onClick={savePg}
                    size="small"
                    disabled={readOnly || saving || !pending}
                    loading={saving}
                  >
                    {saving ? t("saving") : t("save")}
                  </Button>
                </div>
                <div className="topbar__mobile-menu">
                  <ModeToggle isEdit={!readOnly} onChange={toggleEdit} />
                  <button
                    className="topbar__button topbar__button--delete"
                    onClick={() => setDelPgOpen(true)}
                    disabled={deletingPg}
                    title={t("delete")}
                  >
                    <LuTrash2 size={16} />
                  </button>
                </div>
              </>
            )
          )}
        </div>

        <div className="topbar__section topbar__section--right">
          {isLoggedIn ? (
            <>
              <Suspense fallback={<div style={{ width: 24 }} />}>
                <CreateMenuButton currentDialogConfig={currentDialog} />
              </Suspense>
              <LoggedInMenu />
            </>
          ) : (
            <>
              <LanguageSwitcher />
              <NavListItem
                label={t("login")}
                icon={<LuLogIn size={16} />}
                path={RoutePaths.LOGIN}
              />
            </>
          )}
        </div>
      </div>

      {showEdit && (
        <ConfirmModal
          isOpen={delPgOpen}
          onClose={() => setDelPgOpen(false)}
          onConfirm={delPg}
          title={t("deleteDialogTitle", {
            title: page.title || pageKey,
          })}
          message={t("deleteDialogConfirmation")}
          confirmText={t("delete")}
          cancelText={t("cancel")}
          type="error"
          loading={deletingPg}
        />
      )}

      {/* CHANGE: Updated CSS to use Grid for true centering */}
      <style href="topbar-styles" precedence="default">{`
        .topbar {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          background: var(--background);
          position: sticky;
          top: 0;
          padding: 0 var(--space-4);
          z-index: ${zIndex.topbar};
          height: var(--headerHeight);
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s ease-in-out;
          gap: var(--space-4);
        }
        .topbar--scrolled {
            border-bottom-color: var(--border);
        }
        .topbar__section {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .topbar__section--left {
            justify-content: flex-start;
        }
        .topbar__section--right {
            justify-content: flex-end;
        }
        .topbar__center {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          min-width: 0; /* Prevents long titles from pushing layout */
        }
        .topbar__actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .topbar__title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .topbar__button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--textSecondary);
          width: var(--space-8);
          height: var(--space-8);
          border-radius: 6px;
          transition: all .15s ease;
          flex-shrink: 0;
        }
        .topbar__button:hover {
          background: var(--backgroundHover);
          color: var(--text);
        }
        .topbar__button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }
        .topbar__button--delete:hover {
          background: var(--primaryGhost);
          color: var(--error);
        }
        .topbar__button--mobile {
          width: 100% !important;
          justify-content: flex-start !important;
          gap: var(--space-3) !important;
          padding: var(--space-3) !important;
          height: auto !important;
          font-size: 14px;
          font-weight: 400;
        }
        .topbar__spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--borderLight);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .topbar__mobile-menu {
          position: relative;
          display: none;
        }
        .topbar__backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: ${zIndex.topbarMenuBackdrop};
          background: transparent;
        }
        .topbar__dropdown {
          position: absolute;
          top: calc(100% + var(--space-2));
          right: 0;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 8px;
          min-width: 240px;
          padding: var(--space-2);
          z-index: ${zIndex.topbarMenu};
          box-shadow: var(--shadowHeavy);
        }
        .topbar__menu-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          margin-bottom: var(--space-2);
          padding-bottom: var(--space-2);
          border-bottom: 1px solid var(--borderLight);
        }
        .topbar__menu-section:last-child {
          margin: 0;
          padding: 0;
          border: none;
        }
        /* CHANGE: Simplified media query for the new grid layout */
        @media (max-width: 768px) {
          .topbar {
            grid-template-columns: auto 1fr auto; /* Allow center to take more space */
            padding: 0 var(--space-2);
            gap: var(--space-2);
          }
          .topbar__center {
            justify-content: center; /* Center the content within the available space */
          }
          .topbar__title {
            font-size: 15px;
            max-width: calc(100vw - 200px); /* Give it a max-width to prevent overlap */
          }
          .topbar__actions {
            display: none !important;
          }
          .topbar__mobile-menu {
            display: flex;
            align-items: center;
            gap: var(--space-2);
          }
        }
        @media (max-width: 480px) {
          .topbar__title {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
};

export default TopBar;
