import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "app/store";
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
import { Tooltip } from "render/web/ui/Tooltip";
import { CreateSpaceForm } from "create/space/CreateSpaceForm";

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler(e);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

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
    } catch (err) {
      console.error(err);
      toast.error(t("createPageFailed", "创建页面失败"));
    } finally {
      setIsCreating(false);
    }
  }, [dispatch, navigate, t]);

  return { isCreatingPage: isCreating, createNewPage };
};

const CreateMenuButton: React.FC<{
  currentDialogConfig?: { cybots: string[] };
}> = ({ currentDialogConfig }) => {
  const { t } = useTranslation(["common", "space", "chat"]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isLoading: isCreatingDialog, createNewDialog } = useCreateDialog();
  const { isCreatingPage, createNewPage } = useCreatePage();

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  const handleMouseEnter = () => setIsMenuOpen(true);
  const handleMouseLeave = () => setIsMenuOpen(false);

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

  return (
    <>
      <div
        className="create-menu-container"
        ref={menuRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Tooltip content={t("common:create")} placement="bottom">
          <button
            className={`create-btn ${isMenuOpen ? "active" : ""}`}
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={t("common:create")}
          >
            <LuPlus size={16} className={isMenuOpen ? "rotated" : ""} />
          </button>
        </Tooltip>

        {isMenuOpen && (
          <div className="create-menu">
            <button
              className="menu-item"
              onClick={handleCreatePage}
              disabled={isCreatingPage}
            >
              {isCreatingPage ? (
                <div className="spinner" />
              ) : (
                <LuFileText size={16} />
              )}
              <span>{t("page:create_new_page", "新建页面")}</span>
            </button>

            <button className="menu-item" onClick={handleCreateSpace}>
              <LuFolderPlus size={16} />
              <span>{t("space:create_new_space", "新建空间")}</span>
            </button>

            {currentDialogConfig && (
              <button
                className="menu-item"
                onClick={handleCreateDialog}
                disabled={isCreatingDialog}
              >
                {isCreatingDialog ? (
                  <div className="spinner" />
                ) : (
                  <LuMessageSquare size={16} />
                )}
                <span>{t("chat:newchat", "新建对话")}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateSpaceForm onClose={() => setIsModalOpen(false)} />
      </Dialog>

      <style href="create-menu-styles" precedence="high">{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { 
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .create-menu-container { position: relative; }

        .create-btn {
          display: flex; align-items: center; justify-content: center;
          width: var(--space-8); height: var(--space-8);
          background: var(--backgroundSecondary);
          border: 1px solid var(--border);
          border-radius: 6px; cursor: pointer;
          color: var(--textSecondary);
          transition: all 0.2s ease;
        }

        .create-btn:hover {
          background: var(--backgroundHover);
          border-color: var(--borderHover);
          color: var(--primary);
          transform: translateY(-1px);
        }

        .create-btn.active {
          background: var(--primaryBg);
          border-color: var(--primary);
          color: var(--primary);
        }

        .create-btn svg {
          transition: transform 0.2s ease;
        }

        .create-btn svg.rotated {
          transform: rotate(45deg);
        }

        .create-menu {
          position: absolute;
          top: calc(100% + var(--space-2));
          right: 0; min-width: 200px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 4px 20px var(--shadowMedium);
          z-index: ${zIndex.dropdown};
          padding: var(--space-2);
          animation: slideIn 0.15s ease;
        }

        .menu-item {
          display: flex; align-items: center; gap: var(--space-3);
          width: 100%; padding: var(--space-2) var(--space-3);
          background: transparent; border: none;
          border-radius: 4px; cursor: pointer;
          font-size: 14px; color: var(--text);
          transition: background 0.15s ease;
        }

        .menu-item:hover:not(:disabled) {
          background: var(--backgroundHover);
        }

        .menu-item:disabled {
          color: var(--textTertiary); cursor: not-allowed;
        }

        .menu-item + .menu-item {
          margin-top: var(--space-1);
        }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid var(--borderLight);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @media (max-width: 600px) {
          .create-menu {
            left: var(--space-3); right: var(--space-3);
            min-width: auto;
          }
        }
      `}</style>
    </>
  );
};

export default CreateMenuButton;
