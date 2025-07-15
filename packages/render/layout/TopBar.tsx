import React, { useState, Suspense, lazy } from "react";
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

const DeleteButton = ({ cfg, mobile }: { cfg: any; mobile?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { t } = useTranslation();

  const doDelete = async () => {
    if (!cfg.dbKey && !cfg.id) return;
    setBusy(true);
    try {
      await dispatch(deleteCurrentDialog(cfg.dbKey || cfg.id)).unwrap();
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
      <TrashIcon size={16} />
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
        title={t("deleteDialogTitle", { title: cfg.title })}
        message={t("deleteDialogConfirmation")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        loading={busy}
      />
    </>
  );
};

const MobileMenu = ({ cfg }: { cfg: any }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation("chat");
  const { isLoading, createNewDialog } = useCreateDialog();

  const onCreate = () => {
    createNewDialog({ agents: cfg.cybots });
    setOpen(false);
  };

  return (
    <div className="topbar__mobile-menu">
      <button
        className="topbar__button"
        onClick={() => setOpen(!open)}
        aria-label={t("moreOptions")}
      >
        <KebabHorizontalIcon size={16} />
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
                {isLoading ? <Spinner /> : <PlusIcon size={16} />}
                <span>{t("newchat")}</span>
              </button>
              <DeleteButton cfg={cfg} mobile />
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
  const cfg = useAppSelector(selectCurrentDialogConfig);
  const page = useAppSelector(selectPageData);
  const readOnly = useAppSelector(selectIsReadOnly);
  const dbSpace = useAppSelector(selectPageDbSpaceId);
  const saving = useAppSelector(selectIsSaving);
  const pending = useAppSelector(selectHasPendingChanges);
  const curSpace = useAppSelector(selectCurrentSpaceId);

  const [delPgOpen, setDelPgOpen] = useState(false);
  const [deletingPg, setDeletingPg] = useState(false);

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

  return (
    <>
      <div className="topbar">
        <div className="topbar__section">
          {!isLoggedIn && (
            <NavListItem
              label={t("home")}
              icon={<HomeIcon size={16} />}
              path="/"
            />
          )}
          {toggleSidebar && (
            <button
              className="topbar__button"
              onClick={toggleSidebar}
              aria-label={t("toggleSidebar")}
            >
              <ThreeBarsIcon size={16} />
            </button>
          )}
        </div>
        <div className="topbar__center">
          {cfg && !showEdit ? (
            <>
              <h1 className="topbar__title" title={cfg.title}>
                {cfg.title}
              </h1>
              <div className="topbar__actions">
                <DialogInfoPanel />
                <DeleteButton cfg={cfg} />
              </div>
              <MobileMenu cfg={cfg} />
            </>
          ) : (
            showEdit && (
              <>
                <h1 className="topbar__title" title={page.title || ""}>
                  {page.title || t("loading")}
                </h1>
                <div className="topbar__actions">
                  <ModeToggle isEdit={!readOnly} onChange={toggleEdit} />
                  <button
                    className="topbar__button topbar__button--delete"
                    onClick={() => setDelPgOpen(true)}
                    disabled={deletingPg}
                    title={t("delete")}
                  >
                    <TrashIcon size={16} />
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
                    <TrashIcon size={16} />
                  </button>
                </div>
              </>
            )
          )}
        </div>
        <div className="topbar__section">
          {isLoggedIn ? (
            <>
              <Suspense fallback={<div style={{ width: 24 }} />}>
                <CreateMenuButton />
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

      <style href="topbar-styles" precedence="default">{`
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--background);
          position: sticky;
          top: 0;
          padding: 0 var(--space-4);
          z-index: ${zIndex.topbar};
          height: var(--headerHeight);
          border-bottom: 1px solid var(--border);
          gap: var(--space-4);
        }
        .topbar__section {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-shrink: 0;
        }
        .topbar__center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          min-width: 0;
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
          max-width: 30ch;
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
          z-index: ${zIndex.mobileMenuBackdrop};
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
          z-index: ${zIndex.mobileMenuDropdown};
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
        @media (max-width: 768px) {
          .topbar {
            padding: 0 var(--space-2);
            gap: var(--space-2);
          }
          .topbar__center {
            gap: var(--space-2);
          }
          .topbar__title {
            font-size: 15px;
            max-width: 20ch;
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
            max-width: 15ch;
          }
          .topbar__section:first-child > .topbar__button {
            display: flex;
          }
          .topbar__section > * {
            transform: scale(.95);
          }
        }
      `}</style>
    </>
  );
};

export default TopBar;
