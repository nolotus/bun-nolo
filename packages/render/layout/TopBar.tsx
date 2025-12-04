import React, {
  useState,
  useEffect,
  Suspense,
  lazy,
  useMemo,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuLogIn, LuMenu, LuHouse, LuTrash2 } from "react-icons/lu";

// 内部模块导入
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
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { extractUserId } from "core/prefix";
import { zIndex } from "render/styles/zIndex";
import { AppRoutePaths } from "app/constants/routePaths";

// UI 组件导入
import { Tooltip } from "render/web/ui/Tooltip";
import Button from "render/web/ui/Button";
import ModeToggle from "render/web/ui/ModeToggle";
import { ConfirmModal } from "render/web/ui/modal/ConfirmModal";

// 懒加载组件
const DialogMenu = lazy(() => import("./DialogMenu"));
const CreateMenuButton = lazy(() => import("./CreateMenuButton"));
const LanguageSwitcher = lazy(() => import("render/web/ui/LanguageSwitcher"));
const NavListItem = lazy(() => import("render/layout/blocks/NavListItem"));

const TopBar = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { pageKey } = useParams();

  // Redux Selectors
  const page = useAppSelector(selectPageData);
  const readOnly = useAppSelector(selectIsReadOnly);
  const saving = useAppSelector(selectIsSaving);
  const pending = useAppSelector(selectHasPendingChanges);
  const dbSpace = useAppSelector(selectPageDbSpaceId);
  const curSpace = useAppSelector(selectCurrentSpaceId);
  const currentDialog = useAppSelector(selectCurrentDialogConfig);

  // Local State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  // --- Effect: 监听滚动 ---
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Memo: 权限与显示逻辑 ---
  const showEdit = useMemo(() => {
    if (!pageKey?.startsWith("page") || !page?.isInitialized) return false;
    const creator = extractUserId(pageKey);
    return creator === user?.userId || !page?.creator;
  }, [pageKey, page?.isInitialized, page?.creator, user?.userId]);

  const isMac = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)
    );
  }, []);

  // --- Handlers ---
  const handleToggleEdit = useCallback(() => {
    dispatch(toggleReadOnly());
  }, [dispatch]);

  const handleSave = useCallback(async () => {
    try {
      await dispatch(savePage()).unwrap();
      toast.success(t("saveSuccess"));
    } catch (e) {
      if (e instanceof Error && e.message !== "Aborted") {
        toast.error(t("saveFailed"));
      }
    }
  }, [dispatch, t]);

  const handleDelete = useCallback(async () => {
    const spaceId = dbSpace || curSpace;
    if (!pageKey || !spaceId) {
      toast.error(t("deleteFailedInfoMissing"));
      return;
    }

    setDeleting(true);
    try {
      await dispatch(
        deleteContentFromSpace({ contentKey: pageKey, spaceId })
      ).unwrap();
      toast.success(t("deleteSuccess"));
      navigate(-1, { replace: true });
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  }, [dispatch, dbSpace, curSpace, pageKey, navigate, t]);

  // Tooltip 内容
  const SidebarTooltip = (
    <div className="tooltip-shortcut">
      <span>{t("toggleSidebar")}</span>
      <kbd className="tooltip-kbd">{isMac ? "⌘" : "Ctrl"} + B</kbd>
    </div>
  );

  return (
    <>
      <div className={`topbar ${isScrolled ? "topbar--scrolled" : ""}`}>
        {/* 左侧区域 */}
        <div className="topbar__section topbar__section--left">
          {!isLoggedIn && (
            <Suspense fallback={null}>
              <NavListItem
                label={t("home")}
                icon={<LuHouse size={16} />}
                path="/"
              />
            </Suspense>
          )}

          {toggleSidebar && (
            <Tooltip content={SidebarTooltip} placement="bottom">
              <button
                className="topbar__button"
                onClick={toggleSidebar}
                aria-label={t("toggleSidebar")}
              >
                <LuMenu size={16} />
              </button>
            </Tooltip>
          )}
        </div>

        {/* 中间区域 */}
        <div className="topbar__center">
          <Suspense fallback={null}>
            {showEdit ? (
              <>
                {/* 桌面端操作栏 */}
                <div className="topbar__actions">
                  <ModeToggle isEdit={!readOnly} onChange={handleToggleEdit} />
                  <button
                    className="topbar__button topbar__button--delete"
                    onClick={() => setDeleteModalOpen(true)}
                    disabled={isDeleting}
                    title={t("delete")}
                  >
                    <LuTrash2 size={16} />
                  </button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    size="small"
                    disabled={readOnly || saving || !pending}
                    loading={saving}
                  >
                    {saving ? t("saving") : t("save")}
                  </Button>
                </div>

                {/* 移动端精简菜单 */}
                <div className="topbar__mobile-menu">
                  <ModeToggle isEdit={!readOnly} onChange={handleToggleEdit} />
                  <button
                    className="topbar__button topbar__button--delete"
                    onClick={() => setDeleteModalOpen(true)}
                    disabled={isDeleting}
                    title={t("delete")}
                  >
                    <LuTrash2 size={16} />
                  </button>
                </div>
              </>
            ) : currentDialog ? (
              <DialogMenu currentDialog={currentDialog} />
            ) : null}
          </Suspense>
        </div>

        {/* 右侧区域 */}
        <div className="topbar__section topbar__section--right">
          {isLoggedIn ? (
            <Suspense fallback={<div style={{ width: 24 }} />}>
              <CreateMenuButton />
            </Suspense>
          ) : (
            <>
              <Suspense fallback={null}>
                <LanguageSwitcher />
              </Suspense>
              <Suspense fallback={null}>
                <NavListItem
                  label={t("login")}
                  icon={<LuLogIn size={16} />}
                  path={AppRoutePaths.LOGIN}
                />
              </Suspense>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteDialogTitle", { title: page.title || pageKey })}
        message={t("deleteDialogConfirmation")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        loading={isDeleting}
      />

      <style href="topbar-styles" precedence="default">{`
        :root {
          --topbar-blur: 12px;
          --topbar-bg-opacity: 20%;
        }

        /* 顶部栏：固定 56px 高度 + 不允许 flex 收缩 */
        .topbar {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: var(--space-4);

          position: sticky;
          top: 0;
          height: 56px;

          /* 关键：作为 flex 子元素时，不要被压缩 */
          flex: 0 0 56px;

          padding: 0 var(--space-4);
          z-index: ${zIndex.topbar};

          background: color-mix(
            in srgb,
            var(--background),
            transparent var(--topbar-bg-opacity)
          );

          backdrop-filter: blur(var(--topbar-blur));
          -webkit-backdrop-filter: blur(var(--topbar-blur));

          border-bottom: 1px solid transparent;
          transition: border-color 0.2s ease-in-out, background 0.2s ease;
        }

        .topbar--scrolled {
          border-bottom-color: var(--border);
        }

        /* 布局分区 */
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
          min-width: 0;
          justify-content: center;
        }

        .topbar__actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        /* 按钮样式 */
        .topbar__button {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          width: var(--space-8);
          height: var(--space-8);
          background: transparent;
          border: none;
          border-radius: 6px;

          cursor: pointer;
          color: var(--textSecondary);
          transition: all 0.15s ease;
        }
        .topbar__button:hover {
          background: var(--backgroundHover);
          color: var(--text);
        }
        .topbar__button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .topbar__button--delete:hover {
          background: var(--primaryGhost);
          color: var(--error);
        }

        /* Tooltip 内部样式 */
        .tooltip-shortcut {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .tooltip-kbd {
          background: var(--background);
          border: 1px solid var(--border);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          color: var(--textTertiary);
          font-family: sans-serif;
          line-height: 1;
        }

        /* 响应式 */
        .topbar__mobile-menu {
          position: relative;
          display: none;
          align-items: center;
          gap: var(--space-2);
        }

        @media (max-width: 768px) {
          .topbar {
            grid-template-columns: auto 1fr auto;
            padding: 0 var(--space-2);
            gap: var(--space-2);
          }
          .topbar__center {
            justify-content: center;
          }
          .topbar__actions {
            display: none !important;
          }
          .topbar__mobile-menu {
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .topbar__button {
            width: var(--space-7);
            height: var(--space-7);
          }
        }
      `}</style>
    </>
  );
};

export default TopBar;
