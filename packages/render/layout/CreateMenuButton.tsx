import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "app/store";
import { createPage } from "render/page/pageSlice";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { zIndex } from "render/styles/zIndex";
import {
  LuPlus,
  LuFileText,
  LuFolderPlus,
  LuMessageSquare,
} from "react-icons/lu";
import { Dialog } from "render/web/ui/Dialog";
import { CreateSpaceForm } from "create/space/CreateSpaceForm";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { noloAgentId } from "core/init";

// 简化：统一 pointerdown 监听（覆盖鼠标与触屏）
const useClickOutside = (ref, onOutside) => {
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      onOutside?.(e);
    };
    document.addEventListener("pointerdown", handler, { passive: true });
    return () => document.removeEventListener("pointerdown", handler);
  }, [ref, onOutside]);
};

const CreateMenuButton = () => {
  const { t } = useTranslation(["common", "space", "chat"]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const currentDialog = useAppSelector(selectCurrentDialogConfig);
  const { isLoading: isCreatingDialog, createNewDialog } = useCreateDialog();

  // 状态：点击固定 + 悬停显示（open = pinned || hover）
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  const menuRef = useRef(null);
  const hoverTimer = useRef(null);
  const open = pinned || hover;

  const clearHoverTimer = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  const close = useCallback(() => {
    setPinned(false);
    setHover(false);
    clearHoverTimer();
  }, [clearHoverTimer]);

  useClickOutside(menuRef, close);

  const onMouseEnter = useCallback(() => {
    clearHoverTimer();
    setHover(true);
  }, [clearHoverTimer]);

  const onMouseLeave = useCallback(() => {
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setHover(false), 120);
  }, [clearHoverTimer]);

  const togglePinned = useCallback(() => {
    setPinned((v) => !v);
    setHover(false);
    clearHoverTimer();
  }, [clearHoverTimer]);

  const createChat = useCallback(() => {
    const agents = currentDialog?.cybots ?? [noloAgentId];
    createNewDialog({ agents });
    close();
  }, [currentDialog, createNewDialog, close]);

  const createNewPageAndClose = useCallback(async () => {
    setIsCreatingPage(true);
    try {
      const key = await dispatch(createPage()).unwrap();
      navigate(`/${key}?edit=true`);
      close();
    } catch {
      toast.error(t("createPageFailed", "创建页面失败"));
    } finally {
      setIsCreatingPage(false);
    }
  }, [dispatch, navigate, close, t]);

  const openCreateSpace = useCallback(() => {
    setIsModalOpen(true);
    close();
  }, [close]);

  useEffect(() => () => clearHoverTimer(), [clearHoverTimer]);

  return (
    <>
      <div
        className="create-menu"
        ref={menuRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <button
          className={`create-menu__button ${open ? "is-active" : ""}`}
          onClick={togglePinned}
          aria-label={t("common:create")}
        >
          <LuPlus
            size={16}
            className={`create-menu__icon ${open ? "is-rotated" : ""}`}
          />
        </button>

        {open && (
          <>
            <div className="create-menu__overlay" onClick={close} />
            <div className="create-menu__dropdown">
              <button
                className="create-menu__item"
                onClick={createChat}
                disabled={isCreatingDialog}
              >
                {isCreatingDialog ? (
                  <div className="spinner" />
                ) : (
                  <LuMessageSquare size={16} />
                )}
                <span>{t("chat:newchat", "新建对话")}</span>
              </button>

              <button
                className="create-menu__item"
                onClick={createNewPageAndClose}
                disabled={isCreatingPage}
              >
                {isCreatingPage ? (
                  <div className="spinner" />
                ) : (
                  <LuFileText size={16} />
                )}
                <span>{t("page:create_new_page", "新建页面")}</span>
              </button>

              <button className="create-menu__item" onClick={openCreateSpace}>
                <LuFolderPlus size={16} />
                <span>{t("space:create_new_space", "新建空间")}</span>
              </button>
            </div>
          </>
        )}
      </div>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateSpaceForm onClose={() => setIsModalOpen(false)} />
      </Dialog>

      <style href="create-menu-styles" precedence="high">{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn { 
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popInMobile { 
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .create-menu { position: relative; }

        .create-menu__button {
          display: inline-flex; align-items: center; justify-content: center;
          width: var(--space-8); height: var(--space-8);
          background: transparent; border: none; border-radius: var(--space-2);
          color: var(--textTertiary); cursor: pointer; position: relative; overflow: hidden;
          transition: color .2s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .create-menu__button::before {
          content: ''; position: absolute; inset: 0; border-radius: inherit;
          background: var(--backgroundHover); opacity: 0; transition: opacity .2s ease;
        }
        .create-menu__button:hover::before, .create-menu__button.is-active::before { opacity: 1; }
        .create-menu__button:hover, .create-menu__button.is-active { color: var(--text); }

        .create-menu__icon { transition: transform .25s cubic-bezier(.34,1.56,.64,1); stroke-width: 1.5; }
        .create-menu__icon.is-rotated { transform: rotate(45deg); }

        .create-menu__overlay { display: none; }

        .create-menu__dropdown {
          position: absolute; top: calc(100% + var(--space-1)); right: 0;
          min-width: 180px; padding: var(--space-1);
          background: var(--background); border: 1px solid var(--border);
          border-radius: var(--space-3);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,.08), 0 2px 4px -1px rgba(0,0,0,.04);
          backdrop-filter: blur(8px);
          z-index: ${zIndex.dropdown};
          animation: popIn .18s cubic-bezier(.34,1.56,.64,1);
        }

        .create-menu__item {
          display: flex; align-items: center; gap: var(--space-3);
          width: 100%; min-height: 32px;
          padding: var(--space-2) var(--space-3);
          background: transparent; border: none; border-radius: var(--space-1);
          color: var(--text); font-size: 13px; font-weight: 500; cursor: pointer;
          position: relative; overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }
        .create-menu__item::before {
          content: ''; position: absolute; inset: 0; border-radius: inherit;
          background: var(--backgroundHover); opacity: 0; transition: opacity .15s ease;
        }
        .create-menu__item:hover:not(:disabled)::before { opacity: 1; }
        .create-menu__item:disabled { color: var(--textQuaternary); cursor: not-allowed; }

        .create-menu__item svg, .create-menu__item span { position: relative; z-index: 1; }
        .create-menu__item svg { stroke-width: 1.5; }

        .spinner {
          width: 16px; height: 16px;
          border: 1.5px solid var(--borderLight);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }

        @media (max-width: 768px) {
          .create-menu__button { width: 40px; height: 40px; }
          .create-menu__overlay {
            display: block; position: fixed; inset: 0;
            background: rgba(0,0,0,.08); backdrop-filter: blur(4px);
            z-index: calc(${zIndex.dropdown} - 1);
          }
          .create-menu__dropdown {
            position: fixed; top: auto; bottom: var(--space-5);
            left: var(--space-4); right: var(--space-4);
            max-width: 300px; min-width: 0; margin: 0 auto;
            border-radius: var(--space-4); padding: var(--space-2);
            box-shadow: 0 20px 25px -5px rgba(0,0,0,.12), 0 10px 10px -5px rgba(0,0,0,.08);
            animation: popInMobile .22s cubic-bezier(.34,1.56,.64,1);
          }
          .create-menu__item {
            padding: var(--space-3) var(--space-4);
            font-size: 14px; min-height: 44px; border-radius: var(--space-2);
          }
          .create-menu__item svg { width: 18px; height: 18px; }
        }

        @media (hover: none) and (pointer: coarse) {
          .create-menu__button:hover::before, .create-menu__item:hover::before { opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default CreateMenuButton;
